const Braintree = Npm.require("braintree");

let Future = Npm.require("fibers/future");

getGateway = function () {
  let accountOptions = Meteor.Braintree.accountOptions();
  if (accountOptions.environment === "production") {
    accountOptions.environment = Braintree.Environment.Production;
  } else {
    accountOptions.environment = Braintree.Environment.Sandbox;
  }
  let gateway = Braintree.connect(accountOptions);

  return gateway;
};

Meteor.methods({
  /**
   * braintreeSubmit
   * Authorize, or authorize and capture payments from Brinatree
   * https://developers.braintreepayments.com/reference/request/transaction/sale/node
   * @param {String} transactionType - either authorize or capture
   * @param {Object} cardData - Object containing everything about the Credit card to be submitted
   * @param {Object} paymentData - Object containing everything about the transaction to be settled
   * @return {Object} results - Object containing the results of the transaction
   */
  "braintreeSubmit": function (transactionType, cardData, paymentData) {
    let cardDataCopy = {};
    Object.assign(cardDataCopy, cardData);
    cardDataCopy.number = cardDataCopy.number.substring(0, 4)+"XXXXXXXXXXXX";
    cardDataCopy.cvv2 = "XXX";
    ReactionCore.Log.info("braintreeSubmit: userId ",Meteor.userId(),transactionType, " ",cardDataCopy, " ", paymentData);

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
    let gateway = getGateway();
    let paymentObj = Meteor.Braintree.paymentObj();
    if (transactionType === "authorize") {
      paymentObj.options.submitForSettlement = false;
    }
    paymentObj.creditCard = Meteor.Braintree.parseCardData(cardData);
    paymentObj.amount = paymentData.total;

    let fut = new Future();
    this.unblock();

    // check if cart has addresses
    let cart = ReactionCore.Collections.Cart.findOne({ userId: Meteor.userId() });
    if (cart == null || cart.shipping == null || cart.shipping.length < 1
        || cart.billing == null || cart.billing.length < 1 ) {
          ReactionCore.Log.info("braintreeSubmit: userId ",Meteor.userId()," cart has no address before payment! ",account);

          fut.return({
            saved: false,
            error: "cart has no address before payment"
          });
    }

    // check if user has address
    let account = ReactionCore.Collections.Accounts.findOne({_id: Meteor.userId()});
    if (account == null || account.profile.addressBook == null || account.profile.addressBook.length < 1) {
      ReactionCore.Log.info("braintreeSubmit: userId ",Meteor.userId()," user has no address before payment! ",account);

      fut.return({
        saved: false,
        error: "user has no address before payment"
      });
    }

    gateway.transaction.sale(paymentObj, Meteor.bindEnvironment(function (error, result) {
      if (error) {
        ReactionCore.Log.info("braintreeSubmit: userId ",Meteor.userId()," error from gateway ",error);

        fut.return({
          saved: false,
          error: error
        });
      } else if (!result.success) {
        ReactionCore.Log.info("braintreeSubmit: userId ",Meteor.userId()," fail ",result);

        fut.return({
          saved: false,
          response: result
        });
      } else {
        ReactionCore.Log.info("braintreeSubmit: userId ",Meteor.userId()," success ",result);

        fut.return({
          saved: true,
          response: result
        });
      }
    }, function (error) {
      ReactionCore.Log.info("braintreeSubmit: userId ",Meteor.userId()," error on call ",error);

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
    let gateway = getGateway();
    const fut = new Future();
    this.unblock();
    gateway.transaction.submitForSettlement(transactionId, amount, Meteor.bindEnvironment(function (error, result) {
      if (error) {
        fut.return({
          saved: false,
          error: error
        });
      } else {
        fut.return({
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
   * @param {Object} paymentMethod - Object containing everything about the transaction to be settled
   * @param {Number} amount - Amount to be refunded if not the entire amount
   * @return {Object} results - Object containing the results of the transaction
   */
  "braintree/refund/create": function (paymentMethod, amount) {
    check(paymentMethod, Object);
    check(amount, Number);
    let transactionId = paymentMethod.transactions[0].transaction.id;
    let gateway = getGateway();
    const fut = new Future();
    this.unblock();
    gateway.transaction.refund(transactionId, amount, Meteor.bindEnvironment(function (error, result) {
      if (error) {
        fut.return({
          saved: false,
          error: error
        });
      } else if (!result.success) {
        if (result.errors.errorCollections.transaction.validationErrors.base[0].code === "91506") {
          fut.return({
            saved: false,
            error: "Cannot refund transaction until it\'s settled. Please try again later"
          });
        } else {
          fut.return({
            saved: false,
            error: result.message
          });
        }
      } else {
        fut.return({
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
   * braintree/refund/list
   * List all refunds for a transaction
   * https://developers.braintreepayments.com/reference/request/transaction/find/node
   * @param {Object} paymentMethod - Object containing everything about the transaction to be settled
   * @return {Array} results - An array of refund objects for display in admin
   */
  "braintree/refund/list": function (paymentMethod) {
    check(paymentMethod, Object);
    let transactionId = paymentMethod.transactionId;
    let gateway = getGateway();
    this.unblock();
    let braintreeFind = Meteor.wrapAsync(gateway.transaction.find, gateway.transaction);
    let findResults = braintreeFind(transactionId);
    let result = [];
    if (findResults.refundIds.length > 0) {
      for (let refund of findResults.refundIds) {
        let refundDetails = getRefundDetails(refund);
        result.push({
          type: "refund",
          amount: refundDetails.amount,
          created: refundDetails.createdAt,
          currency: refundDetails.currencyIsoCode,
          raw: refundDetails
        });
      }
    }
    return result;
  }
});

getRefundDetails = function (refundId) {
  check(refundId, String);
  let gateway = getGateway();
  let braintreeFind = Meteor.wrapAsync(gateway.transaction.find, gateway.transaction);
  let findResults = braintreeFind(refundId);
  return findResults;
};
