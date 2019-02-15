$(function () {
    var socket = io();

    // init of client after connecting to lobby
    socket.on('init', function (msg) {
        let clientState = msg.clients.find(x => x.id == socket.id);
        $('.inventory').empty();
        clientState && clientState.cards.forEach(card => {
            var html = `<div class="card col-3">${card}</div>`;
            $('.inventory').append(html);
        });
        $('.card').on('click', (e) => {
            var text = $(e.target).text();
            console.log(text)
            socket.emit('clickedCard', text);
        })
    });
})