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
      label: "Merchant ID",
      optional: false
    },
    "settings.public_key": {
      type: String,
      label: "Public Key",
      optional: false
    },
    "settings.private_key": {
      type: String,
      label: "Private Key",
      optional: false
    }
  }
]);

ReactionCore.Schemas.BraintreePayment = new SimpleSchema({
  payerName: {
    type: String,
    //label: "Cardholder name",
    label: function() {
      if(Meteor.isClient || Meteor.isCordova) {
        return(i18next.t('checkoutPayment.payerName'));
      } else {
        return('Cardholder name');
      }
    },
    regEx: /^\w+\s\w+$/
  },
  cardNumber: {
    type: String,
    min: 16,
    max: 19,
    label: function() {
      if(Meteor.isClient || Meteor.isCordova) {
        return(i18next.t('checkoutPayment.cardNumber'));
      } else {
        return('Card number');
      }
    }
  },
  expireMonth: {
    type: String,
    max: 2,
    label: function() {
      if(Meteor.isClient || Meteor.isCordova) {
        return(i18next.t('checkoutPayment.expireMonth'));
      } else {
        return('Expiration month');
      }
    }
  },
  expireYear: {
    type: String,
    max: 4,
    label: function() {
      if(Meteor.isClient || Meteor.isCordova) {
        return(i18next.t('checkoutPayment.expireYear'));
      } else {
        return('Expiration year');
      }
    }
  },
  cvv: {
    type: String,
    max: 4,
    label: function() {
      if(Meteor.isClient || Meteor.isCordova) {
        return(i18next.t('checkoutPayment.cvv'));
      } else {
        return('CVV');
      }
    }
  }
});


ReactionCore.Schemas.BraintreePayment.messages({
  "regEx payerName": "[label] muss Vor- und Nachnamen beinhalten und exakt so geschrieben werden wie auf der Kreditkarte"
});
