ReactionCore.registerPackage
  name: "reaction-braintree"
  provides: ['paymentMethod']
  paymentTemplate: "braintreePaymentForm"
  label: "Braintree"
  description: "Accept Braintree"
  icon: 'fa fa-shopping-cart'
  settingsRoute: "braintree"
  defaultSettings:
    mode: false
    merchant_id: ""
    public_key: ""
    private_key: ""
  priority: '2'
  hasWidget: true
  shopPermissions: [
    {
      label: "Braintree"
      permission: "dashboard/payments"
      group: "Shop Settings"
    }
  ]
