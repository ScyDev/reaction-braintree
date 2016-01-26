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
          error: error
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
    }, function (error) {
      ReactionCore.Events.warn(error);
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
    check(paymentMethod, Object);
    let transactionId = paymentMethod.transactions[0].transaction.id;
    let amount = paymentMethod.transactions[0].transaction.amount;
    let accountOptions = Meteor.Braintree.accountOptions();
    if (accountOptions.environment === "production") {
      accountOptions.environment = Braintree.Environment.Production;
    } else {
      accountOptions.environment = Braintree.Environment.Sandbox;
    }
    let gateway = Braintree.connect(accountOptions);
    const fut = new Future();
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
      ReactionCore.Log.warn(e);
    }));
    return fut.wait();
  },
  /**
   * braintree/refund/create
   * Refund BrainTree payment
   * https://developers.braintreepayments.com/reference/request/transaction/refund/node
   * @return {Object} results - Object containing the results of the transaction
   */
  "braintree/refund/create": function (paymentMethod, amount) {
    check(paymentMethod, Object);
    check(amount, Number);
    let transactionId = paymentMethod.transactions[0].transaction.id;
    let accountOptions = Meteor.Braintree.accountOptions();
    if (accountOptions.environment === "production") {
      accountOptions.environment = Braintree.Environment.Production;
    } else {
      accountOptions.environment = Braintree.Environment.Sandbox;
    }
    let gateway = Braintree.connect(accountOptions);
    const fut = new Future();
    this.unblock();
    gateway.transaction.refund(transactionId, amount, Meteor.bindEnvironment(function (error, result) {
      if (error) {
        fut["return"]({
          saved: false,
          error: error
        });
      } else if (!result.success) {
        if (result.errors.errorCollections.transaction.validationErrors.base[0].code === "91506") {
          fut["return"]({
            saved: false,
            error: "Cannot refund transaction until it\'s settled. Please try again later"
          })
        } else {
          fut["return"]({
            saved: false,
            error: result.message
          })
        }
      }
      else {
        fut["return"]({
          saved: true,
          response: result
        });
      }
    }, function (e) {
      ReactionCore.Log.warn(e);
    }));
    return fut.wait();
  },

  "braintree/refund/list": function (paymentMethod) {
    check(paymentMethod, Object);
    let transactionId = paymentMethod.transactionId;
    let accountOptions = Meteor.Braintree.accountOptions();
    if (accountOptions.environment === "production") {
      accountOptions.environment = Braintree.Environment.Production;
    } else {
      accountOptions.environment = Braintree.Environment.Sandbox;
    }
    let gateway = Braintree.connect(accountOptions);
    const fut = new Future();
    this.unblock();
    gateway.transaction.find(transactionId, Meteor.bindEnvironment(function (error, result) {
    if (error) {
      fut["return"]([]);
    } else if (result.refundIds.length > 0) {
      console.log("we have refunds");
      fut["return"]([]);
    } else {
      console.log("no errors, no refunds");
      fut["return"]([]);
    }

    }));

  }
});

