Meteor.Braintree = {
  accountOptions: function() {
    var environment, options, ref, ref1, ref2, settings;
    settings = ReactionCore.Collections.Packages.findOne({
      name: "reaction-braintree"
    }).settings;
    if ((settings != null ? settings.mode : void 0) === true) {
      environment = "production";
    } else {
      environment = "sandbox";
    }
    options = {
      environment: environment,
      merchantId: (settings != null ? settings.merchant_id : void 0) || ((ref = Meteor.settings.braintree) != null ? ref.merchant_id : void 0),
      publicKey: (settings != null ? settings.public_key : void 0) || ((ref1 = Meteor.settings.braintree) != null ? ref1.public_key : void 0),
      privateKey: (settings != null ? settings.private_key : void 0) || ((ref2 = Meteor.settings.braintree) != null ? ref2.private_key : void 0)
    };
    if (!options.merchantId) {
      throw new Meteor.Error(403, "Invalid Braintree Credentials");
    }
    return options;
  },
  authorize: function(cardData, paymentData, callback) {
    Meteor.call("braintreeSubmit", "authorize", cardData, paymentData, callback);
  },
  capture: function(transactionId, amount, callback) {
    var captureDetails;
    captureDetails = {
      amount: amount
    };
    Meteor.call("braintreeCapture", transactionId, captureDetails, callback);
  },
  config: function(options) {
    this.accountOptions = options;
  },
  paymentObj: function() {
    return {
      amount: "",
      options: {
        submitForSettlement: true
      }
    };
  },
  parseCardData: function(data) {
    return {
      cardholderName: data.name,
      number: data.number,
      expirationMonth: data.expirationMonth,
      expirationYear: data.expirationYear,
      cvv: data.cvv
    };
  },
  parseCurrencyData: function(data) {}
};
