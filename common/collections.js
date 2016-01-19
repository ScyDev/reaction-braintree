/*
 *  Meteor.settings.braintree =
 *    mode: false  #sandbox
 *    merchant_id: ""
 *    public_key: ""
 *    private_key: ""
 *  see: https://developers.braintreepayments.com/javascript+node/reference
 */

ReactionCore.Schemas.BraintreePackageConfig = new SimpleSchema([
  ReactionCore.Schemas.PackageConfig,
  {
    "settings.mode": {
      type: Boolean,
      defaultValue: false
    },
    "settings.merchant_id": {
      type: String,
      label: "Merchant ID"
    },
    "settings.public_key": {
      type: String,
      label: "Public Key"
    },
    "settings.private_key": {
      type: String,
      label: "Private Key"
    }
  }
]);

ReactionCore.Schemas.BraintreePayment = new SimpleSchema({
  payerName: {
    type: String,
    label: "Cardholder name",
    regEx: /^\w+\s\w+$/
  },
  cardNumber: {
    type: String,
    min: 16,
    label: "Card number"
  },
  expireMonth: {
    type: String,
    max: 2,
    label: "Expiration month"
  },
  expireYear: {
    type: String,
    max: 4,
    label: "Expiration year"
  },
  cvv: {
    type: String,
    max: 4,
    label: "CVV"
  }
});


ReactionCore.Schemas.BraintreePayment.messages({
  "regEx payerName": "[label] must include both first and last name"
});
