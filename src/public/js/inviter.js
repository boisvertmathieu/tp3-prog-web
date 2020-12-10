$('*[id="checkbox"]').each(function () {
    $(this).on('click', function () {
        var nb_invitations = 0;
        $('*[id="checkbox"]').each(function () {
            if ($(this).is(':checked')) {
                nb_invitations++;
            }
        });
        console.log(nb_invitations);
        if (nb_invitations >= 4) {
            alert('Vous ne pouvez plus inviter personne');
            if ($(this).is(':checked')) {
                $(this).prop('checked', false);
            }
        }
    });
});