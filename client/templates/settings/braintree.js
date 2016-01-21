/* eslint no-unused-vars: 0 */

Template.braintreeSettings.helpers({
  packageData: function () {
    return ReactionCore.Collections.Packages.findOne({
      name: "reaction-braintree"
    });
  }
});

Template.braintree.helpers({
  packageData: function () {
    let packageData = ReactionCore.Collections.Packages.findOne({
      name: "reaction-braintree"
    });
    return packageData;
  }
});

Template.braintree.events({
  "click [data-event-action=showBraintreeSettings]": function () {
    ReactionCore.showActionView();
  }
});

AutoForm.hooks({
  "braintree-update-form": {
    onSuccess: function (operation, result, template) {
      Alerts.removeSeen();
      return Alerts.add("Braintree settings saved.", "success");
    },
    onError: function (operation, error, template) {
      Alerts.removeSeen();
      return Alerts.add("Braintree settings update failed. " + error, "danger");
    }
  }
});
