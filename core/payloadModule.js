const logger = require("../utils/logger").init();

class PayloadModule {
  constructor(domain) {
    this.domain = domain;

    this.create = {
      context: this.test,
      message: {
        provider: this.createProvider,
        item: this.createItem,
      },
    };
    this.validate = {
      context: this.validateContext,
      message: {
        provider: this.validateProvider,
        item: this.validateMessage,
      },
    };
  }

  createProvider = (session, data) => {
    const payload = {};

    payload.id = data.providerId;

    if (session.providerDescription) {
      payload.descriptor = {
        image: [],
        name: session.providerDescription.name,
        short_desc: session.providerDescription.shortDesc,
        long_desc: session.providerDescription.longDesc,
      };
    }

    if (session.providerTags || data.providerTags) {
      payload.tags = this.buildTags(session.providerTags || data.providerTags);
    }
  };

  buildTags = (tags) => {
    return Object.keys(tags).map((key) => {
      const subObject = tags[key];

      let display =
        subObject["display"] === undefined
          ? {}
          : { display: subObject["display"] };
      delete subObject["display"];
      const list = Object.keys(subObject).map((subKey) => {
        const value = subObject[subKey];
        return {
          descriptor: {
            code: subKey,
          },
          value: typeof value === "string" ? value : value.toString(),
        };
      });

      return {
        descriptor: {
          code: key,
        },
        ...display,
        list: list,
      };
    });
  };

  test = () => {
    console.log("working>>>>>");
  };

  createItem = (data) => {
    console.log("creatring Item", data);
  };

  buildContext = (session, action) => {
    const contextConfig = [
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
    const context = {};

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

  createNestedField = (obj, path, value) => {
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

    currentObj[keys[keys.length - 1]] = value;
  };
}

module.exports = PayloadModule;
