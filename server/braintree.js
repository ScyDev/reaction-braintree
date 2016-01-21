const Braintree = Npm.require("braintree");

let Fiber = Npm.require("fibers");

let Future = Npm.require("fibers/future");

Meteor.methods({
  "braintreeSubmit": function (transactionType, cardData, paymentData) {
    var accountOptions, fut, gateway, paymentObj;
    check(transactionType, String);
    check(cardData, {
      name: String,
      number: String,
      expirationMonth: String,
      expirationYear: String,
      cvv2: String,
      type: String
    });
    check(paymentData, {
      total: String,
      currency: String
    });
    accountOptions = Meteor.Braintree.accountOptions();
    if (accountOptions.environment === "production") {
      accountOptions.environment = Braintree.Environment.Production;
    } else {
      accountOptions.environment = Braintree.Environment.Sandbox;
    }
    gateway = Braintree.connect(accountOptions);
    paymentObj = Meteor.Braintree.paymentObj();
    if (transactionType === "authorize") {
      paymentObj.options.submitForSettlement = false;
    }
    paymentObj.creditCard = Meteor.Braintree.parseCardData(cardData);
    paymentObj.amount = paymentData.total;
    fut = new Future();
    this.unblock();
    gateway.transaction.sale(paymentObj, Meteor.bindEnvironment(function (error, result) {
      if (error) {
        fut["return"]({
          saved: false,
          error: err
        });
      } else if (!result.success) {
        fut["return"]({
          saved: false,
          response: result
        });
      } else {
        fut["return"]({
          saved: true,
          response: result
        });
      }
    }, function (e) {
      ReactionCore.Events.warn(e);
    }));
    return fut.wait();
  },


  /**
   * braintree/payment/capture
   * Capture payments from Braintree
   * https://developers.braintreepayments.com/reference/request/transaction/submit-for-settlement/node
   * @param {Object} paymentMethod - Object containing everything about the transaction to be settled
   * @return {Object} results - Object containing the results of the transaction
   */
  "braintree/payment/capture": function (paymentMethod) {
    var fut, gateway;
    check(paymentMethod, Object);
    let transactionId = paymentMethod.transactions[0].transaction.id;
    let amount = paymentMethod.transactions[0].transaction.amount;
    let accountOptions = Meteor.Braintree.accountOptions();
    if (accountOptions.environment === "production") {
      accountOptions.environment = Braintree.Environment.Production;
    } else {
      accountOptions.environment = Braintree.Environment.Sandbox;
    }
    gateway = Braintree.connect(accountOptions);
    fut = new Future();
    this.unblock();
    gateway.transaction.submitForSettlement(transactionId, amount, Meteor.bindEnvironment(function (error, result) {
      if (error) {
        fut["return"]({
          saved: false,
          error: error
        });
      } else {
        fut["return"]({
          saved: true,
          response: result
        });
      }
    }, function (e) {
      ReactionCore.Events.warn(e);
    }));
    return fut.wait();
  }
});

