Template.braintreeSettings.helpers({
  packageData: function() {
    return ReactionCore.Collections.Packages.findOne({
      name: "reaction-braintree"
    });
  }
});


Template.braintreeSettings.helpers({
  packageData: function() {
    return ReactionCore.Collections.Packages.findOne({
      name: "reaction-braintree"
    });
  }
});

AutoForm.hooks({
  "braintree-update-form": {
    onSuccess: function(operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add("Braintree settings saved.", "success", {
        autoHide: true
      });
    },
    onError: function(operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add("Braintree settings update failed. " + error, "danger");
    }
  }
});
