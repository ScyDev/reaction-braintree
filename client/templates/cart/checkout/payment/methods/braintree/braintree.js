var handleBraintreeSubmitError, hidePaymentAlert, paymentAlert, submitting, uiEnd;

uiEnd = function(template, buttonText) {
  template.$(":input").removeAttr("disabled");
  template.$("#btn-complete-order").text(buttonText);
  return template.$("#btn-processing").addClass("hidden");
};

paymentAlert = function(errorMessage) {
  return $(".alert").removeClass("hidden").text(errorMessage);
};

hidePaymentAlert = function() {
  return $(".alert").addClass("hidden").text('');
};

handleBraintreeSubmitError = function(error) {
  return console.log(error);
};

submitting = false;

AutoForm.addHooks("braintree-payment-form", {
  onSubmit: function(doc) {
    var form, storedCard, template;
    submitting = true;
    template = this.template;
    hidePaymentAlert();
    form = {
      name: doc.payerName,
      number: doc.cardNumber,
      expirationMonth: doc.expireMonth,
      expirationYear: doc.expireYear,
      cvv2: doc.cvv,
      type: getCardType(doc.cardNumber)
    };
    storedCard = form.type.charAt(0).toUpperCase() + form.type.slice(1) + " " + doc.cardNumber.slice(-4);
    Meteor.Braintree.authorize(form, {
      total: ReactionCore.Collections.Cart.findOne().cartTotal(),
      currency: Shops.findOne().currency
    }, function(error, transaction) {
      var normalizedMode, normalizedStatus, paymentMethod;
      submitting = false;
      if (error) {
        handleBraintreeSubmitError(error);
        uiEnd(template, "Resubmit payment");
      } else {
        if (transaction.saved === true) {
          normalizedStatus = (function() {
            switch (transaction.response.transaction.status) {
              case "authorization_expired":
                return "expired";
              case "authorized":
                return "created";
              case "authorizing":
                return "pending";
              case "settlement_pending":
                return "pending";
              case "settlement_confirmed":
                return "settled";
              case "settlement_declined":
                return "failed";
              case "failed":
                return "failed";
              case "gateway_rejected":
                return "failed";
              case "processor_declined":
                return "failed";
              case "settled":
                return "settled";
              case "settling":
                return "pending";
              case "submitted_for_settlement":
                return "pending";
              case "voided":
                return "voided";
              default:
                return "failed";
            }
          })();
          normalizedMode = (function() {
            switch (transaction.response.transaction.status) {
              case "settled":
                return "capture";
              case "settling":
                return "capture";
              case "submitted_for_settlement":
                return "capture";
              case "settlement_confirmed":
                return "capture";
              case "authorized" || "authorizing":
                return "authorize";
              default:
                return "capture";
            }
          })();
          paymentMethod = {
            processor: "Braintree",
            storedCard: storedCard,
            method: transaction.response.transaction.creditCard.cardType,
            transactionId: transaction.response.transaction.id,
            amount: transaction.response.transaction.amount,
            status: normalizedStatus,
            mode: normalizedMode,
            createdAt: new Date(transaction.response.create_time),
            updatedAt: new Date(transaction.response.update_time),
            transactions: []
          };
          paymentMethod.transactions.push(transaction.response);
          Meteor.call("cart/processPayment", paymentMethod);
        } else {
          handleBraintreeSubmitError(transaction.response.message);
          uiEnd(template, "Resubmit payment");
        }
      }
    });
    return false;
  },
  beginSubmit: function() {
    this.template.$(":input").attr("disabled", true);
    this.template.$("#btn-complete-order").text("Submitting ");
    return this.template.$("#btn-processing").removeClass("hidden");
  },
  endSubmit: function() {
    if (!submitting) {
      return uiEnd(this.template, "Complete your order");
    }
  }
});
