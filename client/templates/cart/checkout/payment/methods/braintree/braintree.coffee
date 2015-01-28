getCardType = (number) ->
  re = new RegExp("^4")
  return "visa"  if number.match(re)?
  re = new RegExp("^(34|37)")
  return "amex"  if number.match(re)?
  re = new RegExp("^5[1-5]")
  return "mastercard"  if number.match(re)?
  re = new RegExp("^6011")
  return "discover"  if number.match(re)?
  ""

uiEnd = (template, buttonText) ->
  template.$(":input").removeAttr("disabled")
  template.$("#btn-complete-order").text(buttonText)
  template.$("#btn-processing").addClass("hidden")

paymentAlert = (errorMessage) ->
  $(".alert").removeClass("hidden").text(errorMessage)

hidePaymentAlert = () ->
  $(".alert").addClass("hidden").text('')

handleBraintreeSubmitError = (error) ->
  console.log error
  # Depending on what they are, errors come back from Braintree in various formats
  singleError = error?.response?.error_description
  serverError = error?.response?.message
  errors = error?.response?.details || []
  if singleError
    paymentAlert("Oops! " + singleError)
  else if errors.length
    for error in errors
      formattedError = "Oops! " + error.issue + ": " + error.field.split(/[. ]+/).pop().replace(/_/g,' ')
      paymentAlert(formattedError)
  else if serverError
    paymentAlert("Oops! " + serverError)


Template.braintreePaymentForm.helpers
  monthOptions: () ->
    monthOptions =
      [
        { value: "", label: "Choose month"}
        { value: "01", label: "1 - January"}
        { value: "02", label: "2 - February" }
        { value: "03", label: "3 - March" }
        { value: "04", label: "4 - April" }
        { value: "05", label: "5 - May" }
        { value: "06", label: "6 - June" }
        { value: "07", label: "7 - July" }
        { value: "08", label: "8 - August" }
        { value: "09", label: "9 - September" }
        { value: "10", label: "10 - October" }
        { value: "11", label: "11 - November" }
        { value: "12", label: "12 - December" }
      ]
    monthOptions

  yearOptions: () ->
    yearOptions = [{ value: "", label: "Choose year" }]
    year = new Date().getFullYear()
    for x in [1...9] by 1
      yearOptions.push { value: year , label: year}
      year++
    yearOptions

# used to track asynchronous submitting for UI changes
submitting = false

AutoForm.addHooks "braintree-payment-form",
  onSubmit: (doc) ->
    # Process form (pre-validated by autoform)

    submitting = true
    template = this.template
    hidePaymentAlert()

    # Format data for braintree
    form = {
      name: doc.payerName
      number: doc.cardNumber
      expire_month: doc.expireMonth
      expire_year: doc.expireYear
      cvv2: doc.cvv
      type: getCardType(doc.cardNumber)
    }

    # Reaction only stores type and 4 digits
    storedCard = form.type.charAt(0).toUpperCase() + form.type.slice(1) + " " + doc.cardNumber.slice(-4)

    # Submit for processing
    Meteor.Braintree.authorize form,
      total: Session.get "cartTotal"
      currency: Shops.findOne().currency
    , (error, transaction) ->
      submitting = false
      if error
        # this only catches connection/authentication errors
        handleBraintreeSubmitError(error)
        # Hide processing UI
        uiEnd(template, "Resubmit payment")
        return
      else
        if transaction.saved is true #successful transaction

          # Normalize status
          braintreeStatus = transaction.payment.transaction.status
          normalizedStatus = switch braintreeStatus
            when "authorization_expired" then "expired"
            when "authorized" then "created"
            when "authorizing" then "pending"
            when "settlement_pending" then "pending"
            when "settlement_confirmed" then "settled"
            when "settlement_declined" then "failed"
            when "failed" then "failed"
            when "gateway_rejected" then "failed"
            when "processor_declined" then "failed"
            when "settled" then "settled"
            when "settling" then "pending"
            when "submitted_for_settlement" then "pending"
            when "voided" then "voided"
            else "failed"

          # Normalize mode
          braintreeType = transaction.payment.transaction.type
          normalizedMode = switch
            when braintreeType is "sale" then "sale"
            when braintreeStatus is "authorized" or "authorizing" then "authorization"
            #when _ is _ then "order"
            else "sale"

          # Response object to pass to CartWorkflow
          paymentMethod =
            processor: "Braintree"
            storedCard: storedCard
            method: transaction.payment.transaction.creditCard.cardType
            transactionId: transaction.payment.transaction.id
            amount: transaction.payment.transaction.amount
            status: normalizedStatus
            mode: normalizedMode
            createdAt: new Date(transaction.payment.create_time)
            updatedAt: new Date(transaction.payment.update_time)
            transactions: transaction.payment

          # Store transaction information with order
          # paymentMethod will auto transition to
          # CartWorkflow.paymentAuth() which
          # will create order, clear the cart, and update inventory,
          # and goto order confirmation page
          CartWorkflow.paymentMethod(paymentMethod)
          return
        else # card errors are returned in transaction
          handleBraintreeSubmitError(transaction.error)
          # Hide processing UI
          uiEnd(template, "Resubmit payment")
          return

    return false;

  beginSubmit: (formId, template) ->
    # Show Processing
    template.$(":input").attr("disabled", true)
    template.$("#btn-complete-order").text("Submitting ")
    template.$("#btn-processing").removeClass("hidden")
  endSubmit: (formId, template) ->
    # Hide processing UI here if form was not valid
    uiEnd(template, "Complete your order") if not submitting
