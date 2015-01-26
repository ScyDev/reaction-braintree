ReactionCore.registerPackage
  name: "reaction-braintree"
  provides: ['paymentMethod']
  paymentTemplate: "braintreePaymentForm"
  label: "Braintree"
  description: "Accept Braintree payments"
  icon: 'fa fa-credit-card'
  settingsRoute: "braintree"
  hasWidget: true
  priority: "2"
  shopPermissions: [
    {
      label: "Braintree Payments"
      permission: "dashboard/payments"
      group: "Shop Settings"
    }
  ]