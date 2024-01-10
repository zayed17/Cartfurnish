
var clipboard = new ClipboardJS('#copyButton');

clipboard.on('success', function (e) {
    console.log('Text successfully copied to clipboard:', e.text);
});







//delete address
function deleteAddress(addressId) {
    Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to delete this address.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
    }).then((result) => {
        if (result.isConfirmed) {
            const data = { id: addressId };

            fetch('/deleteaddress', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then(response => response.json())
                .then((response) => {
                    if (response.deleted == true) {
                        // Reload the specified div after successful deletion
                        $('#addrassArea').load('/account #addrassArea');
                        Swal.fire({
                            icon: 'success',
                            title: 'Address Deleted!',
                            text: 'The address has been successfully deleted.',
                        });
                    } else {
                        // Handle other cases or errors here
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: response.message,
                        });
                    }
                })
                .catch(error => {
                    console.error('Error deleting address:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Failed to delete the address. Please try again.',
                    });
                });
        }
    });
}


//add address
$(document).ready(function () {
    $('#submitAddressBtn').on('click', function () {
        var formData = $('#addAddressForm').serialize();
        console.log(formData)
        $.ajax({
            type: 'POST',
            url: '/addaddresses',
            data: formData,
            success: function (response) {
                console.log(response)
                if (response.add == true) {
                    $('#addrassArea').load('/account #addrassArea');
                    $('#addAddressModal').modal('hide');
                    $('.modal-backdrop').remove();
                    Swal.fire({
                        icon: 'success',
                        title: 'Address Added Successfully',
                        text: 'Your address has been added successfully.',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'There was a problem adding your address!',
                    });
                }
            },
            error: function (error) {
                console.error('Error:', error);
            }
        });
    });
});




//edit address
function showEditAddressModal(fullName, country, housename, state, city, pincode, phone, email, addressId) {
    document.getElementById('fullNames').value = fullName;
    document.getElementById('countrys').value = country;
    document.getElementById('housenames').value = housename;
    document.getElementById('states').value = state;
    document.getElementById('citys').value = city;
    document.getElementById('pincodes').value = pincode;
    document.getElementById('phones').value = phone;
    document.getElementById('emails').value = email;
    document.getElementById('addressId').value = addressId;

    $('#addAddressModals').modal('show');
}

$('#submitAddressBtns').on('click', function () {
    const formData = $('#addAddressForms').serialize();
    console.log(formData);

    $.ajax({
        type: 'POST',
        url: '/editaddresses',
        data: formData,
        success: function (response) {
            if (response.success == true) {
                $('#addrassArea').load('/checkout #addrassArea');
                $('#addAddressModals').modal('hide');
                $('.modal-backdrop').remove();

            }
        },
        error: function (error) {
            console.error('Error:', error);
        }
    });

    return false;
});



//add money to wallet!	   
    $(document).ready(function () {
        $("#rechargeBtn").on("click", function () {
            $("#rechargeModal").css("display", "block");
        });

        $(".close, #rechargeModal").on("click", function () {
            $("#rechargeModal").css("display", "none");
        });

        $(".modal-content").on("click", function (event) {
            event.stopPropagation();
        });

        $("#confirmRechargeBtn").on("click", function () {
            var rechargeAmount = $("#rechargeAmountInput").val();
            console.log(rechargeAmount, "amount")
            $.ajax({
                type: 'POST',
                url: '/rechargeWallet',
                data: {
                    rechargeAmount: rechargeAmount
                },
                success: function (response) {
                    if (response.success) {
                        razorpayPayment(response.order, rechargeAmount);
                        $("#rechargeModal").css("display", "none");
                    } else {
                        alert('Failed to create recharge order. Please try again.');
                    }
                },
                error: function (error) {
                    console.error('Error:', error);
                    alert('An error occurred while processing your request.');
                }
            });
        });
        function razorpayPayment(order, rechargeAmount) {
            console.log(rechargeAmount);
        
            var options = {
                "key": "rzp_test_6nfEH21z7G2Wtu",
                "amount": parseInt(rechargeAmount) * 100,
                "currency": "INR",
                "name": "Furni.Ltd",
                "description": "Wallet Recharge",
                "image": "",
                "order_id": order.id,
                "prefill": {
                    "name": "Furni Ltd",
                    "email": "furniworld@gmail.com",
                    "contact": "9999999999"
                },
                "notes": {
                    "address": "India"
                },
                "theme": {
                    "color": "#cc9967"
                },
                "handler": function (response) {
                    console.log('Payment successful:', response);
                    var enteredAmount = order.amount / 100;
                    console.log('Entered Amount:', enteredAmount);
                    verifyPayment(response, order, enteredAmount);
                }
            };
        
            var rzp1 = new Razorpay(options);
        
            rzp1.open();
        
            rzp1.on('widget.close', function () {
                options.amount = parseInt(rechargeAmount) * 100;
                rzp1.update(options);
            });
        }
        

        function verifyPayment(payment, order, rechargeAmount) {
            console.log(payment, order, rechargeAmount, "payment, order, rechargeAmount");
        
            $.ajax({
                url: "/walletverify",
                method: "post",
                data: {
                    payment: payment,
                    order: order,
                    rechargeAmount: rechargeAmount
                },
                success: function (response) {
                    if (response.success) {
                        $.get('/account', function (data) {
                            var updatedContent = $(data).find('#wallethistory').html();
                            $('#wallethistory').html(updatedContent);
                        });
                    } else {
                        alert('Wallet recharge failed. Please try again.');
                    }
                },
                error: function (error) {
                    console.error('Error:', error);
                    alert('An error occurred while processing your request.');
                }
            });
        }
        
    });





