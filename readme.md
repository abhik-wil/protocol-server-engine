# Setting Up Grafana with Loki

### Step 1: Create a folder named as grafana & Configure Loki

  Create a file named `loki-config.yml` with the following content:
   ```
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  wal:
    enabled: true
    dir: /loki/wal

schema_config:
  configs:
    - from: 2024-06-18
      store: boltdb
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb:
    directory: /loki/index
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  ingestion_rate_mb: 8  # Increase this value
  ingestion_burst_size_mb: 16

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: true
  retention_period: 24h

ruler:
  storage:
    type: local
    local:
      directory: /loki/rules
  rule_path: /loki/rules-temp
  ring:
    kvstore:
      store: inmemory
  enable_api: true
   ```
### Step 2: Configure Promtail(optional): 
  ```
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: varlogs
          __path__: /var/log/*log
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
    relabel_configs:
      - source_labels: [__meta_docker_container_name]
        target_label: container
      - source_labels: [__meta_docker_container_label_com_docker_swarm_service_name]
        target_label: service
  ``` 
  ### Step 3: Create a Docker Compose File:
```
version: '3.7'

services:
  grafana:
    image: grafana/grafana:latest
    user: "1000"
    container_name: grafana
    ports:
      - "4000:3000"
    restart: unless-stopped
    networks:
      - monitoring

  loki:
    image: grafana/loki:2.7.0
    container_name: loki
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yaml:/etc/loki/local-config.yaml
      - ./wal:/loki/wal
      - ./loki/index:/loki/index
      - ./loki/chunks:/loki/chunks
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - monitoring
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
    restart: always

  promtail:
    image: grafana/promtail:2.7.1
    container_name: promtail
    volumes:
      - ./promtail-config.yaml:/etc/promtail/config.yml
      - /var/log:/var/log
    command: -config.file=/etc/promtail/config.yml
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
  ```

  ### Step 4: Add loki_trasnport with logger library to forward logs from your application directly to a Loki instance
  ```
  For reference, check '.utils/logger' file
  ```  
 ### Step 5: Start the Services 
  ``` docker-compose build && docker-compose up ```
### Step 6: Configure Grafana
- Open your web browser and navigate to http://localhost:4000
- Log in with the default username and password (admin/admin).
- Add Loki as a data source
  - Set the URL to http://loki:3100
  - Click Save & Test.
### Step 7: Create a Dashboard  


