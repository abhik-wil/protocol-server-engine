const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger").init();
const SERVER_TYPE  = process.env.SERVER_TYPE

// convert stringified payload into object
const parseString = (object)=>{

  if(typeof object === 'object'){
    return object
  }else{
    return parseString(JSON.parse(object))
  }
}


const buildTags = (tags,populateName,populateTagName) => {
  tags = parseString(tags)
  return Object.keys(tags).map((key) => {
    const subObject = {...tags[key]};

    let display =
      subObject["display"] === undefined
        ? {}
        : { display: subObject["display"] };
    delete subObject["display"];
    const tagname = populateTagName? {name:key}:{}
    const list = Object.keys(subObject).map((subKey) => {
      const value = subObject[subKey];
      const listname = populateName? {name:subKey}:{}
      return {
        descriptor: {
          code: subKey,
          ...listname
        },
        value: typeof value === "string" ? value : value.toString(),
      };
    });

    return {
      descriptor: {
        code: key,
        ...tagname

      },
      ...display,
      list: list,
    };
  });
};

const buildContext = (session, action) => {
  const contextConfig_buyer = [
    {
      beckn_key: "bap_id",
      value: "session.bap_id",
    },
    {
      beckn_key: "bap_uri",
      value: "session.bap_uri",
    },
    {
      beckn_key: "bpp_id",
      value: "session.bpp_id",
    },
    {
      beckn_key: "bpp_uri",
      value: "session.bpp_uri",
    },
    {
      beckn_key: "location.country.code",
      value: "session.country",
    },
    {
      beckn_key: "location.city.code",
      value: "session.cityCode",
    },
    {
      beckn_key: "transaction_id",
      value: "session.currentTransactionId",
    },
    {
      beckn_key: "message_id",
      value: "uuidv4()",
    },
    {
      beckn_key: "timestamp",
      value: "new Date().toISOString()",
    },
    {
      beckn_key: "domain",
      value: "session.domain",
    },
    {
      beckn_key: "version",
      value: "session.version",
    },
    {
      beckn_key: "ttl",
      value: "session.ttl",
    },
    {
      beckn_key: "action",
      value: "action",
    },
  ];

  const contextConfig_seller = [
    {
      beckn_key: "bap_id",
      value: "session.bap_id",
    },
    {
      beckn_key: "bap_uri",
      value: "session.bap_uri",
    },
    {
      beckn_key: "bpp_id",
      value: "session.bpp_id",
    },
    {
      beckn_key: "bpp_uri",
      value: "session.bpp_uri",
    },
    {
      beckn_key: "location.country.code",
      value: "session.country",
    },
    {
      beckn_key: "location.city.code",
      value: "session.cityCode",
    },
    {
      beckn_key: "transaction_id",
      value: "session.currentTransactionId",
    },
    {
      beckn_key: "message_id",
      value: "session.message_id",
    },
    {
      beckn_key: "timestamp",
      value: "new Date().toISOString()",
    },
    {
      beckn_key: "domain",
      value: "session.domain",
    },
    {
      beckn_key: "version",
      value: "session.version",
    },
    {
      beckn_key: "ttl",
      value: "session.ttl",
    },
    {
      beckn_key: "action",
      value: "action",
    },
  ];
  const context = {};
  const contextConfig = SERVER_TYPE === "BPP" ? contextConfig_seller : contextConfig_buyer
  contextConfig.map((item) => {
    try {
      if (eval(item.value) && (item.check ? eval(item.check) : true))
        createNestedField(
          context,
          item.beckn_key,
          item.compute ? eval(item.compute) : eval(item.value)
        );
    } catch (err) {
      logger.info(item.value + " is undefined, will not be mapping that");
    }
  });

  return context;
};

const createNestedField = (obj, path, value) => {
  const keys = path.split(".");
  let currentObj = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const isArrayIndex = /\[\d+\]/.test(key); // Check if the key represents an array index

    if (isArrayIndex) {
      const arrayKey = key.substring(0, key.indexOf("["));
      const index = parseInt(key.match(/\[(\d+)\]/)[1], 10);

      if (!currentObj[arrayKey]) {
        currentObj[arrayKey] = [];
      }

      if (!currentObj[arrayKey][index]) {
        currentObj[arrayKey][index] = {};
      }

      currentObj = currentObj[arrayKey][index];
    } else {
      if (!currentObj[key]) {
        currentObj[key] = {};
      }
      currentObj = currentObj[key];
    }
  }
  // handle array insertion ex key[0]
  const isArrayIndex = /\[\d+\]/.test(keys[keys.length - 1]); // Check if the key represents an array index
  if(isArrayIndex){
    const key = keys[keys.length - 1]
    const arrayKey = key.substring(0, key.indexOf("["));
    const index = parseInt(key.match(/\[(\d+)\]/)[1], 10);
    currentObj[arrayKey] = Array.isArray(currentObj[arrayKey])  ?  currentObj[arrayKey] : []
    if(currentObj[arrayKey][index] === undefined){
      console.log(keys,"index not present in array therefore pushing into the array" )
      currentObj[arrayKey] = [...currentObj[arrayKey],value]
    }else{
      currentObj[arrayKey][index] = value
    }
    
    return
  }
  currentObj[keys[keys.length - 1]] = value;
};

const createPayload = (config, action, data, session) => {
  const payload = {};
  const startPoint = "START";
  const endPoint = "END";
  const cancelName = "Ride Cancellation";
  const successStatus = "SUCCESS";
  const fulfillmentText = "fulfillment";
  const messageId = uuidv4();
  const paymentId = uuidv4();
  const timestamp = new Date().toISOString();
  const newTranscationId = uuidv4();

  config.map((item) => {

    try {

      if(item.loop){
        if(Array.isArray(eval(item.value))){
          if(item.value.includes("||")){ // handle || (OR) case
              let flag = false
              const splitValue = item.value.split("||")
              for(const value of splitValue){
                  if(flag)continue
                  if(Array.isArray(eval(value))){
                    item.value = value // update item.value = whichever || condition is array
                    flag = true
                  }
              }
          }

          eval(item.value).forEach((element,index)=>{
            // update indexes for each iteration
            const currentValue = `${item.value}[${index}]${item.beckn_key.split('[index]')[1]}`
            const currentBecknkey = item.beckn_key.replace('index',index) 
            
              createNestedField(
                payload,
                currentBecknkey,
                item.compute ? eval(item.compute) : eval(currentValue)
              );
          })
          return

        }
      }

      if(item.value === "data.paymentTagsSearch       || session.paymentTagsSearch"){
        console.log("temp")
      }

      if (eval(item.value) && (item.check ? eval(item.check) : true))
        createNestedField(
          payload,
          item.beckn_key,
          item.compute ? eval(item.compute) : eval(item.value)
        );
    } catch (err) {
      logger.info(item.value + " is undefined, will not be mapping that");
    }
  });

  return payload;
};

const constructValueObject = (data, key = "business_key") => {
  const dataArray = data.split(",").map((val) => val.trim());
  let objArray = [];

  dataArray.forEach((item) => {
    const obj = {};
    const itemArray = item.split(":").map((val) => val.trim());
    obj[key] = itemArray[0];
    const value = "obj." + itemArray[1];
    obj["value"] = value.split(".").join("?.");
    objArray.push(obj);
  });

  return objArray;
};

const constructPath = (data) => {
  if (data.startsWith(".")) {
    data = data.substring(1, data.length);
  }

  data = "obj." + data;
  return data.split(".").join("?.");
};

const decodeInputString = (input) => {
  const tokens = input
    .split(/([\[\]\{\}])/)
    .filter((token) => token.trim() !== "");

  if (input.split(".")[0] === "session") {
    return tokens[0].split(".").join("?.");
  }

  if (tokens.length === 1) {
    return "obj?." + tokens[0].split(".").join("?.");
  }

  let i = 0;
  let initalConfig = {};
  let currentConfig = initalConfig;
  let lastTokenSquareBracket = false;
  let lastTokenCurlyBracket = false;

  while (i < tokens.length) {
    if (lastTokenSquareBracket) {
      if (tokens[i] === "]") {
        currentConfig.type = "Array";
        lastTokenSquareBracket = false;

        if (tokens[i + 1] !== "{") {
          currentConfig.value = {};
          currentConfig = currentConfig.value;
        }
      } else {
        currentConfig.check =
          "_?." + tokens[i].substring(2, tokens[i].length - 1);
      }
    } else if (lastTokenCurlyBracket) {
      if (tokens[i] === "}") {
        if (i === tokens.length - 1) {
          if (!currentConfig.value) {
            currentConfig.value = {};
          }
          currentConfig.value.type = "Object";
          currentConfig.value.value = constructValueObject(
            tokens[i - 1],
            "key"
          );
          currentConfig = currentConfig.value;
        } else {
          currentConfig.commanData = constructValueObject(tokens[i - 1]);
          currentConfig.value = {};
          currentConfig = currentConfig.value;
        }
        lastTokenCurlyBracket = false;
      }
    } else if (tokens[i] === "[") {
      lastTokenSquareBracket = true;
    } else if (tokens[i] === "{") {
      lastTokenCurlyBracket = true;
    } else if (
      tokens[i] !== "[" ||
      tokens[i] !== "{" ||
      tokens[i] !== "]" ||
      tokens[i] !== "}"
    ) {
      currentConfig.path = constructPath(tokens[i]);
    }
    i += 1;
  }

  return initalConfig;
};

const extractData = (obj, config, commData = {}) => {
  if (config?.commanData?.length) {
    config.commanData.map((item) => {
      createNestedField(
        commData,
        item.business_key,
        typeof item.value === "string"
          ? eval(item.value)
          : extractData(obj, item)
      );
    });
  }

  const item = config.value;
  if (item.type === "Array") {
    const response = [];
    eval(item.path)?.some((data) => {
      const _ = data;
      if (item.check ? eval(item.check) : true) {
        const result = extractData(data, item, commData);
        if (result) {
          response.push(result);
        }
      }
    });
    return response;
  } else if (item.type === "String") {
    let data = {};
    data[`${item.key}`] = eval(item.path);

    return { ...data, ...commData };
  } else if (item.type === "Object") {
    const data = {};
    item.value.map((val) => {
      if (!eval(val.value)) {
        // console.log(`key ${val.value} not found`);
        // data[val.key] = undefined;
      } else {
        data[val.key] = eval(val.value);
      }
    });
    return { ...data, ...commData };
  }
};

const createBusinessPayload = (myconfig, obj, session) => {
  const payload = {};

  try {
    myconfig.map((conf) => {
      if (conf.extractionPath) {
        conf = {
          ...conf,
          value: decodeInputString(conf.extractionPath),
        };

        createNestedField(
          payload,
          conf.business_key,
          typeof conf.value === "string"
            ? eval(conf.value)
            : extractData(obj, conf).flat(Infinity)
        );
      }
    });

    return payload;
  } catch (e) {
    logger.info("error while creating bussniss payload", e);
    console.log("error while creating bussniss payload", e);
    return payload;
  }
};

const createBecknObject = (session, type, data, config) => {
    
  if (config.sessionData) {
    const updatedSession = createPayload(
      config.sessionData,
      type,
      data,
      session
    );
    session = { ...session, ...updatedSession };

  }
  const payload = createPayload(config.mapping, type, data, session);
  if(config.afterMapping){
    const updatedSession = createPayload(
    config.afterMapping,
    type,
    payload,
    session
  );
  session = { ...session, ...updatedSession };

  }
  return { payload, session };
};

const extractBusinessData = (type, payload, session, protocol) => {
  if (protocol.sessionData) {
    const parsedSchema = createBusinessPayload(protocol.sessionData, payload);

    console.log("parsedSchaems", parsedSchema);

    session = { ...session, ...parsedSchema };
  }

  const result = createBusinessPayload(protocol.mapping, payload, session);

  return { result, session };
};

const extractPath = (path, obj) => {
  const payload = {};

  try {
    const value = decodeInputString(path);

    createNestedField(
      payload,
      "data",
      typeof value === "string"
        ? eval(value)
        : extractData(obj, { value }).flat(Infinity)
    );

    return payload;
  } catch (e) {
    logger.info("error while creating bussniss payload", e);
    return payload;
  }
};

module.exports = {
  createBecknObject,
  extractBusinessData,
  extractPath,
};
