// Objectify Form
function objectifyForm(formArray) {
    returnArray = {};
    for (var i = 0; i < formArray.length; i++) {
        returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
}


// Handle Cookies
function create_cookie(name, value, days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000) + 300000);
    var expires = "; expires=" + date.toGMTString();
    document.cookie = name + "=" + value + expires + "; path=/";
}

function read_cookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

function delete_cookie(name) {
    create_cookie(name, "", -1);
}

// YAASC Client
client = new YAASClient({
    host: 'localhost',
    port: 8080,
    vhost: 'payt',
    exchange: 'aveiro',
    secure: window.location.hostname == "portal.life-payt.eu",
    username: read_cookie('user_id') || 'anonymous',
    password: read_cookie('access_token') || 'anonymous'
});

client.on_invalid_login = function() {
    delete_cookie('user_id');
    delete_cookie('access_token');
}

client.on_connect = function() {
    if (client.is_authenticated()) {
        window.location.replace('dashboard.html');
    }
}

client.connect();

function login(username, password, remember_me) {
    var _remember_me = remember_me && true;

    client.call('payt.auth.payt_login', {
        exchange: 'auth',
        args: [username, password],
        callback: function(data) {
            if (data) {
                user_id = data[0];
                token = data[1];
                validated = data[2];

                console.log('validated: ' + validated);

                if (validated) {
                    if (user_id && token) {
                        create_cookie('user_id', user_id, _remember_me ? 5 : 0);
                        create_cookie('access_token', token, _remember_me ? 5 : 0);
                    }
                    window.location.replace('dashboard.html');
                } else
                    displaySignUpForm(user_id, token, _remember_me);
            } else {
                $('.log-status').addClass('wrong-entry');
                $('.log-status').effect("shake");
                $('.alert').text('Credenciais inválidas');
                $('.alert').fadeIn(500);
                setTimeout("$('.alert').fadeOut(1500);", 3000);
            }
        }
    });
}

function logout() {
    delete_cookie('user_id');
    delete_cookie('access_token');
    client.connect({ username: 'anonymous', password: 'anonymous' });
}

function errorShake(selector, text) {
    $(selector).addClass('wrong-entry');
    $(selector).effect("shake");
    $('.alert').text(text);
    $('.alert').fadeIn(500);
}

function displaySignUpForm(user_id, token, _remember_me) {
    $('#signIn').hide();
    $('#signUp').show();

    if ($('#signup_form').length) {
        $('#signup_form').unbind('submit');
        $('#signup_form').on('submit', function(e) {
            e.preventDefault();
            var d = objectifyForm($(this).serializeArray());

            var error = false;

            if (d.passwd !== d.confirm_passwd) {
                errorShake('.log-status', 'Palavra-passe e confirmação não coincidem');
                error = true;
            } else {
                if (!d.email) {
                    errorShake('#su_email', 'Campos obrigatórios');
                    error = true;
                }
                if (!d.passwd) {
                    errorShake('#su_passwd', 'Campos obrigatórios');
                    error = true;
                }
                if (!d.confirm_passwd) {
                    errorShake('#su_cpasswd', 'Campos obrigatórios');
                    error = true;
                }
            }

            if (error) {
                setTimeout("$('.alert').fadeOut(1500);", 3000);
            } else {
                client.call('payt.auth.validate_user', {
                    exchange: 'auth',
                    args: [user_id, d.email, sha256(d.passwd)],
                    callback: function(res) {
                        if (!res) {
                            if (user_id && token) {
                                create_cookie('user_id', user_id, _remember_me ? 5 : 0);
                                create_cookie('access_token', token, _remember_me ? 5 : 0);
                            }
                            window.location.replace('dashboard.html');
                        } else {
                            console.log('Old & new passwords are the same, try again');
                        }
                    }
                });
            }
        });
    }
}

function setLoginForm() {
    if ($('#login_form').length) {
        $('#login_form').on('submit', function(e) {
            e.preventDefault();
            var d = objectifyForm($(this).serializeArray());
            login(d.username, sha256(d.password), d.remember_me === 'on');
        });
        $('.form-control').keypress(function() {
            $('.form-group').removeClass('wrong-entry');
        });
    }
}

setLoginForm();