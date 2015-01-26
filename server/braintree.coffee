Braintree = Npm.require('braintree')
Fiber = Npm.require("fibers")
Future = Npm.require("fibers/future")

accountOptions = Meteor.Braintree.accountOptions()
if accountOptions.environment is "production"
  accountOptions.environment = Braintree.Environment.Production
else
  accountOptions.environment = Braintree.Environment.Sandbox

gateway = Braintree.connect accountOptions

Meteor.methods
  #submit (sale, authorize)
  braintreeSubmit: (transactionType, cardData, paymentData) ->

    paymentObj = Meteor.Braintree.paymentObj()
    if transactionType is "authorize" then paymentObj.options.submitForSettlement = true
    paymentObj.creditCard = Meteor.Braintree.parseCardData(cardData)
    paymentObj.amount = Meteor.Braintree.parsePaymentData(paymentData)

    fut = new Future()
    @unblock()

    gateway.transaction.sale paymentObj, Meteor.bindEnvironment((err, payment) ->
      if err
        fut.return
          saved: false
          error: err
      else
        fut.return
          saved: true
          payment: payment
      return
    , (e) ->
      ReactionCore.Events.warn e
      return
    )
    fut.wait()

  # capture (existing authorization)
  braintreeCapture: (transactionId, captureDetails) ->
    Braintree.configure Meteor.Braintree.accountOptions()

    fut = new Future()
    @unblock()
    Braintree.authorization.capture transactionId, captureDetails, (error, capture) ->
      if error
        fut.return
          saved: false
          error: error
      else
        fut.return
          saved: true
          capture: capture
      return
    fut.wait()


# braintreePackage = ReactionCore.Collections.Packages.findOne(name: "reaction-braintree")
#
# if braintreePackage?.settings
#   ReactionCore.Events.trace {name: "reactioncommerce:reaction-braintree", settings: braintreePackage}
#   settings = braintreePackage.settings
#   gateway = Braintree.connect(
#     environment: Braintree.Environment.Sandbox
#     merchantId: settings.merchant_id
#     publicKey: settings.public_key
#     privateKey: settings.private_key
#   )
#
# Meteor.methods
#   braintreeSubmit: (cardData, amount) ->
#     fut = new Future()
#
#     gateway.transaction.sale
#       amount: amount
#       creditCard:
#         number: cardData.number
#         expirationMonth: cardData.expirationMonth
#         expirationYear: cardData.expirationYear
#         cvv: cardData.cvv
#       , (err, payment) ->
#         if err
#           fut.return
#             saved: false
#             error: err
#         else if payment.success
#           fut.return
#             saved: true
#             payment: payment
#         else
#           console.log result.message
#         return
#
#     fut.wait()
