Meteor.Braintree =
{
  accountOptions() {
    let environment;
    let settings = ReactionCore.Collections.Packages.findOne({
      name: "reaction-braintree",
      shopId: ReactionCore.getShopId(),
      enabled: true
    }).settings;
    if (typeof settings !== "undefined" && settings !== null ? settings.mode : undefined === true) {
      environment = "production";
    } else {
      environment = "sandbox";
    }

    let ref = Meteor.settings.braintree;
    let options = {
      environment: environment,
      merchantId: getSettings(settings, ref, "merchant_id"),
      publicKey: getSettings(settings, ref, "public_key"),
      privateKey: getSettings(settings, ref, "private_key")
    };
    if (!options.merchantId) {
      throw new Meteor.Error("403", "Invalid Braintree Credentials");
    }
    return options;
  },

  // authorize submits a payment authorization to Braintree
  authorize(cardData, paymentData, callback) {
    Meteor.call("braintreeSubmit", "authorize", cardData, paymentData, callback);
  },

  // config is for the braintree configuration settings.
  config(options) {
    this.accountOptions = options;
  },

  paymentObj() {
    return {
      amount: "",
      options: {submitForSettlement: true}
    };
  },

  // parseCardData splits up the card data and puts it into a braintree friendly format.
  parseCardData(data) {
    return {
      cardholderName: data.name,
      number: data.number,
      expirationMonth: data.expirationMonth,
      expirationYear: data.expirationYear,
      cvv: data.cvv
    };
  }

  // This needs work to support multi currency
  // Braintree uses merchant ids that must be preconfigured for each currency
  // See: https://developers.braintreepayments.com/javascript+node/sdk/server/transaction-processing/create#specifying-merchant-account
  // parseCurrencyData(data) {
  // }
};

getSettings = function (settings, ref, valueName) {
  if (settings !== null) {
    return settings[valueName];
  } else if (ref !== null) {
    return ref[valueName];
  }
};
