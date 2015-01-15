ReactionCore.registerPackage
  name: "reaction-braintree"
  provides: ['paymentMethod']
  label: "Braintree"
  description: "Braintree Payment for Reaction Commerce"
  icon: 'fa fa-shopping-cart'
  settingsRoute: "braintree"
  hasWidget: false
  priority: "2"
  shopPermissions: [
    {
      label: "Braintree Payments"
      permission: "dashboard/payments"
      group: "Shop Settings"
    }
  ]