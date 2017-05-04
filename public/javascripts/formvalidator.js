$(document).ready(function() {
		$('#register_form').bootstrapValidator({
			// To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
			feedbackIcons: {
				valid: 'glyphicon glyphicon-ok',
				invalid: 'glyphicon glyphicon-remove',
				validating: 'glyphicon glyphicon-refresh'
			},
			fields: {
				firstName: {
					validators: {
						stringLength: {
							min: 3,
						},
						notEmpty: {
							message: 'Please supply your first name'
						}
					}
				},
				lastName: {
					validators: {
						stringLength: {
							min: 3,
						},
						notEmpty: {
							message: 'Please supply your last name'
						}
					}
				},
				username: {
					validators: {
						stringLength: {
							min: 3
						},
						notEmpty: {
							message: 'At least 3 characters in length'
						}
					}
				},
				email: {
					validators: {
						notEmpty: {
							message: 'Please supply your email address'
						},
						emailAddress: {
							message: 'Please supply a valid email address'
						}
					}
				},
				age: {
					validators: {
						notEmpty: {
							message: 'Please specify your age'
						}
					}
				}
			}
		})
	})
	.on('success.form.bv', function(e) {
		$('#success_message').slideDown({
				opacity: "show"
			}, "slow") // Do something ...
		$('#contact_form').data('bootstrapValidator').resetForm();

		// Prevent form submission
		e.preventDefault();

		// Get the form instance
		var $form = $(e.target);

		// Get the BootstrapValidator instance
		var bv = $form.data('bootstrapValidator');

		// Use Ajax to submit form data
		$.post($form.attr('action'), $form.serialize(), function(result) {
			console.log(result);
		}, 'json');
	});
