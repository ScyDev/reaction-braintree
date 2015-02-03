ReactionCore.registerPackage
  name: "reaction-braintree"
  provides: ['paymentMethod']
  paymentTemplate: "braintreePaymentForm"
  label: "Braintree"
  description: "Braintree Payment for Reaction Commerce"
  icon: 'fa fa-credit-card'
  settingsRoute: "braintree"
  defaultSettings:
    mode: false
    merchant_id: ""
    public_key: ""
    private_key: ""
  priority: "2"
  hasWidget: true
  autoEnable: false
  shopPermissions: [
    {
      label: "Braintree"
      permission: "dashboard/payments"
      group: "Shop Settings"
    }
  ]
