(function($) {
    $(() => {
        const checkAccount = (account) => {
            if (!account) return false // empty
            if (!/^[^\s]*$/.test(account)) {
                // has space character
                return false
            }
            return true
        }

        $("#join-meeting").click(function(e) {
            //join btn clicked
            e.preventDefault();
            var account = $("#account-name").val() || "";

            if (!/^[^\s]*$/.test(account)) {
                
            }
            if (checkAccount(account.trim())) {
                //account has to be a non empty numeric value
                window.location.href = `meeting.html?account=${account}`;
            } else {
                $("#account-name").removeClass("is-invalid").addClass("is-invalid");
            }
        });
    });
}(jQuery));