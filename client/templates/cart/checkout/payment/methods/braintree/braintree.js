/* eslint camelcase: 0 */

var submitToBrainTree;

uiEnd = function (template, buttonText) {
  template.$(":input").removeAttr("disabled");
  template.$("#btn-complete-order").text(buttonText);
  return template.$("#btn-processing").addClass("hidden");
};

paymentAlert = function (errorMessage) {
  return $(".alert").removeClass("hidden").text(errorMessage);
};

hidePaymentAlert = function () {
  return $(".alert").addClass("hidden").text('');
};

handleBraintreeSubmitError = function (error) {
  let serverError = error !== null ? error.message : void 0;
  if (serverError) {
    return paymentAlert("Oops! " + serverError);
  } else if (error) {
    return paymentAlert("Oops! " + error);
  }
};

let submitting = false;

handleBrainTreeResponse = function (error, results) {
  console.log("got a Response!!!");

  let paymentMethod;
  submitting = false;
  if (error) {
    handleBraintreeSubmitError(error);
    uiEnd(template, "Resubmit payment");
  } else {
    if (results.saved === true) {
      let normalizedStatus = normalizedStates[results.response.transaction.status];
      if (typeof normalizedStatus !== "undefined") {
        normalizedStatus = normalizedStates.default;
      }
      let normalizedMode = normalizedModes[results.response.transaction.status];
      if (typeof normalizedMode !== "undefined") {
        normalizedMode = normalizedModes.default;
      }

      paymentMethod = {
        processor: "Braintree",
        storedCard: storedCard,
        method: results.response.transaction.creditCard.cardType,
        transactionId: results.response.transaction.id,
        amount: results.response.transaction.amount,
        status: normalizedStatus,
        mode: normalizedMode,
        createdAt: new Date(results.response.create_time),
        updatedAt: new Date(results.response.update_time),
        transactions: []
      };
      paymentMethod.transactions.push(results.response);
      Meteor.call("cart/submitPayment", paymentMethod);
    } else {
      handleBraintreeSubmitError(results.response.message);
      uiEnd(template, "Resubmit payment");
    }
  }

};

submitToBrainTree = function (doc) {
  submitting = true;
  hidePaymentAlert();
  let form = {
    name: doc.payerName,
    number: doc.cardNumber,
    expirationMonth: doc.expireMonth,
    expirationYear: doc.expireYear,
    cvv2: doc.cvv,
    type: getCardType(doc.cardNumber)
  };
  let storedCard = form.type.charAt(0).toUpperCase() + form.type.slice(1) + " " + doc.cardNumber.slice(-4);
  let cartTotal = ReactionCore.Collections.Cart.findOne().cartTotal();
  let currencyCode = Shops.findOne().currency;

  Meteor.Braintree.authorize(form, {
    total: cartTotal,
    currency: currencyCode
  }, handleBrainTreeResponse);
};

AutoForm.addHooks("braintree-payment-form", {
  onSubmit: function (doc) {
    console.log("handling onSubmit");
    submitToBrainTree(doc);
  },
  beginSubmit: function () {
    this.template.$(":input").attr("disabled", true);
    this.template.$("#btn-complete-order").text("Submitting ");
    return this.template.$("#btn-processing").removeClass("hidden");
  },
  endSubmit: function () {
    if (!submitting) {
      return uiEnd(this.template, "Complete your order");
    }
  }
});

const normalizedStates = {
  authorization_expired: "expired",
  authorized: "created",
  authorizing: "pending",
  settlement_pending: "pending",
  settlement_confirmed: "settled",
  settlement_declined: "failed",
  failed: "failed",
  gateway_rejected: "failed",
  processor_declined: "failed",
  settled: "settled",
  settling: "pending",
  submitted_for_settlement: "pending",
  voided: "voided",
  default: "failed"
};

const normalizedModes = {
  settled: "capture",
  settling: "capture",
  submitted_for_settlement: "capture",
  settlement_confirmed: "capture",
  authorized: "authorize",
  authorizing: "authorize",
  default: "capture"
};
