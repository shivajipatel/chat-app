var name = getQueryVariable('name') || 'Guest';
var room = getQueryVariable('room');

console.log(name + ' wants to join ' + room);

var socket = io();

jQuery(".room-title").text(room);

socket.on('connect', function () {
    console.log("connected to socket.io server!");
    socket.emit('joinRoom', {
        name: name,
        room: room
    });
});

socket.on('message', function (message) {
    console.log("New message!");
    console.log(message.text);
    var momentTimeStamp = moment.utc(message.timeStamp);
    var $messages = jQuery('.messages');
    $messages.append('<li class="collection-item avatar"><i class="material-icons circle green">insert_chart</i><p><strong>' + message.name + ' ' + momentTimeStamp.local().format('h:mm a') + '</strong><br>' + message.text + '</p></li>');
    //$messages.append('<p><strong>' + message.name + ' ' + momentTimeStamp.local().format('h:mm a') + '</strong></p>');
    //$messages.append('<p>' + message.text + '</p>');
});

//handle form submit
var $form = jQuery("form#myForm");
$form.on('submit', function (event) {
    event.preventDefault();
    var $message = $form.find('input[name=message]');
    socket.emit('message', {
        name: name,
        text: $message.val()
    });
    $message.val('');
});