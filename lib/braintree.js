Meteor.Braintree =
{
  accountOptions() {
    var ref;
    var ref1;
    var ref2;
    var settings = ReactionCore.Collections.Packages.findOne({name: "reaction-braintree"}).settings;
    if (((typeof settings !== "undefined" && settings !== null) ? settings.mode : undefined) === true) {
      var environment = "production";
    } else {
      environment = "sandbox";
    }
    var options =
    {
        environment: environment,
        merchantId: ((typeof settings !== "undefined" && settings !== null) ? settings.merchant_id : undefined) || (((ref = Meteor.settings.braintree) != null) ? ref.merchant_id : undefined),
        publicKey: ((typeof settings !== "undefined" && settings !== null) ? settings.public_key : undefined) || (((ref1 = Meteor.settings.braintree) != null) ? ref1.public_key : undefined),
        privateKey: ((typeof settings !== "undefined" && settings !== null) ? settings.private_key : undefined) || (((ref2 = Meteor.settings.braintree) != null) ? ref2.private_key : undefined)
    };
    if (!options.merchantId) {
      throw new Meteor.Error(403, "Invalid Braintree Credentials");
    }
    return options;
  },

  // authorize submits a payment authorization to Braintree
  authorize(cardData, paymentData, callback) {
    Meteor.call("braintreeSubmit", "authorize", cardData, paymentData, callback);
  },

  // TODO - add a "charge" function that creates a new charge and captures all at once

  capture(transactionId, amount, callback) {
    const captureDetails = {amount: amount};
    console.log("calling capture");
    Meteor.call("braintreeCapture", transactionId, captureDetails, callback);
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
  },

  // This needs work to support multi currency
  // Braintree uses merchant ids that must be preconfigured for each currency
  // See: https://developers.braintreepayments.com/javascript+node/sdk/server/transaction-processing/create#specifying-merchant-account
  parseCurrencyData(data) {

  }
};
