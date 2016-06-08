/* eslint camelcase: 0 */

uiEnd = function (template, buttonText) {
  template.$(":input").removeAttr("disabled");
  template.$("#btn-complete-order").text(buttonText);
  return template.$("#btn-processing").addClass("hidden");
};

paymentAlert = function (errorMessage) {
  return $(".alert").removeClass("hidden").text(errorMessage);
};

hidePaymentAlert = function () {
  return $(".alert").addClass("hidden").text("");
};

function checkNested(obj /*, level1, level2, ... levelN*/) {
  var args = Array.prototype.slice.call(arguments, 1);
  for (var i = 0; i < args.length; i++) {
    if (!obj || !obj.hasOwnProperty(args[i])) {
      return false;
    }
    obj = obj[args[i]];
  }
  return true;
}

handleBraintreeSubmitError = function (error, results) {
  let serverError = error !== null ? error.message : void 0;
  if (serverError) {
    return paymentAlert("Server Error " + serverError);
  } else if (error) {
    try {
      if(checkNested(results, 'response', 'errors', 'errorCollections', 'transaction', 'errorCollections', 'creditCard', 'validationErrors', 'number')) {
        let errorList = results.response.errors.errorCollections.transaction.errorCollections.creditCard.validationErrors.number;
        if(typeof errorList != undefined && errorList.length > 0) {
          error = "";
          for(let singleError in errorList) {
            error = error + i18next.t("checkoutPayment.braintreeErrors." + errorList[singleError].code, errorList[singleError].message) + " ";
          }
        }
      }
      else if(checkNested(results, 'response', 'transaction', 'proccessorResponseCode')) {
        error = i18next.t("checkoutPayment.braintreeErrors.processorResponse." + results.response.transaction.proccessorResponseCode, results.response.message);
      }
    }
    catch (err) {
      error = results.response.message;
    }
    return paymentAlert(error);
  }
};

let submitting = false;

submitToBrainTree = function (doc, template) {
  // check if still enough inventory Quantity of products available
  let cart = ReactionCore.Collections.Cart.findOne();
  console.log("cart: ",cart);

  let account = ReactionCore.Collections.Accounts.findOne({_id: Meteor.userId()});
  if (account == null || account.profile == null || account.profile.addressBook == null || account.profile.addressBook.length < 1) {
    Alerts.alert({
        title: i18next.t("accountsUI.error.noAddress", "No address"),
        text: i18next.t("accountsUI.error.youNeedToEnterYourAddress", "You need to enter your address."),
        type: "error",
      },
      function() {
        // ...
      }
    );

    return false;
  }

  // ############### TTTTESTING!!!!!!!! #############
  //console.log("deleting cart ");
  //Meteor.call("cart/deleteCart", cart._id, Session.get("sessionId"));
  //let account = ReactionCore.Collections.Accounts.findOne({_id: Meteor.userId()});
  //ReactionCore.Collections.Accounts.update({_id: Meteor.userId()}, {$set: {"profile.addressBook": [] } });
  //Meteor.call("cart/deleteCartAdresses", cart._id, Session.get("sessionId"));

  if (!cart.shipping || cart.shipping.length < 1
      || !cart.billing || cart.billing.length < 1 ) {
    /*
    Alerts.alert({
        title: i18next.t("order.cartMissingAddress", "Cart is missing an address"),
        text: i18next.t("order.cartMissingAddressText", "Something went wrong at our end."),
        type: "error",
      },
      function() {
        // ...
      }
    );*/

    Alerts.alert({
        title: i18next.t("accountsUI.error.noAddress", "No address"),
        text: i18next.t("accountsUI.error.youNeedToEnterYourAddress", "You need to enter your address."),
        type: "error",
      },
      function() {
        // ...
      }
    );

    // delete cart
    /*
    console.log("deleting cart ");
    let account = ReactionCore.Collections.Accounts.findOne({_id: Meteor.userId()});
    ReactionCore.Collections.Accounts.update({_id: Meteor.userId()}, {$set: {"profile.addressBook": [] } });
    //if (!account.profile.addressBook || account.profile.addressBook.length < 1) {
    //Meteor.call("cart/deleteCart", cart._id, Session.get("sessionId"));
    Meteor.call("cart/deleteCartAdresses", cart._id, Session.get("sessionId"));
    */

    return false;
  }

  Meteor.call("cart/checkInventoryQuantity", cart._id, function(error, result) {
      if (error) {
        console.log("error from cart/checkInventoryQuantity:",error);

        Alerts.alert({
            title: i18next.t("order.outOfStock", "No longer available"),
            text: i18next.t("order.productInventoryHasChanged", "We're sorry. Somebody bought this product while you were shopping."),
            type: "warning",
          },
          function() {
            // ...
          }
        );

        //handleBraintreeSubmitError(error);
        uiEnd(template, i18next.t("checkoutPayment.resubmitPayment", "Resubmit payment"));

        return;
      }
      else if (result === true) {

        // the original code of function submitToBrainTree()
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
          let cartTotal = ReactionCore.Collections.Cart.findOne().cartTotal();
          let currencyCode = ReactionCore.Collections.Shops.findOne().currency;

          console.log("Braintree authorize: "+cartTotal+" "+currencyCode);
          Meteor.Braintree.authorize(form, {
            total: cartTotal,
            currency: currencyCode
          }, function (error, results) {
            let paymentMethod;
            submitting = false;
            if (error) {
              console.log("Braintree failed: %o", error);
              handleBraintreeSubmitError(error, results);
              uiEnd(template, i18next.t("checkoutPayment.resubmitPayment", "Resubmit payment"));
            } else {

              if (results.saved === true) {
                let normalizedStatus = normalizeState(results.response.transaction.status);
                let normalizedMode = normalizeMode(results.response.transaction.status);
                let storedCard = results.response.transaction.creditCard.cardType.toUpperCase() + " " + results.response.transaction.creditCard.last4;
                paymentMethod = {
                  processor: "Braintree",
                  storedCard: storedCard,
                  method: results.response.transaction.creditCard.cardType,
                  transactionId: results.response.transaction.id,
                  amount: parseFloat(results.response.transaction.amount),
                  status: normalizedStatus,
                  mode: normalizedMode,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  transactions: []
                };
                paymentMethod.transactions.push(results.response);
                Meteor.call("cart/submitPayment", paymentMethod);
              } else {
                console.log("Braintree failed: %o", results);
                handleBraintreeSubmitError(results.response.message, results);
                uiEnd(template, i18next.t("checkoutPayment.resubmitPayment", "Resubmit payment"));
              }
            }
          });
      }
    }
  );

};

Template.braintreePaymentForm.onCreated(() => {
  for(var key in SimpleSchema._globalMessages) {
    if(key != "regEx") {
      //console.log(SimpleSchema._globalMessages[key]);
      SimpleSchema._globalMessages[key] = i18next.t("globalMessages." + key, SimpleSchema._globalMessages[key]);
    }
  }
});

AutoForm.addHooks("braintree-payment-form", {
  onSubmit: function (doc) {
    submitToBrainTree(doc, this.template);
    return false;
  },
  beginSubmit: function () {
    this.template.$(":input").attr("disabled", true);
    this.template.$("#btn-complete-order").text(i18next.t("checkoutPayment.submitting", "Submitting"));
    return this.template.$("#btn-processing").removeClass("hidden");
  },
  endSubmit: function () {
    if (!submitting) {
      return uiEnd(this.template, i18next.t("checkoutPayment.completeYourOrder", "Complete your order"));
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

normalizeState = function (stateString) {
  let normalizedState = normalizedStates[stateString];
  if (typeof normalizedState === "undefined") {
    normalizedState = normalizedStates.default;
  }
  return normalizedState;
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

normalizeMode = function (modeString) {
  let normalizedMode = normalizedModes[modeString];
  if (typeof normalizedMode === "undefined") {
    normalizedMode = normalizedModes.default;
  }
  return normalizedMode;
};
