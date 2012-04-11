$(function (){
    window.gist = function(addr){
        $.ajax({
            url: addr,
            type: 'GET',
            dataType: 'jsonp',
            success: function(data, textStatus, xhr) {
                var id = addr.match(/(\d+)\.json$/)[1];
                console.log(id);
                var div = document.createElement('div');
                div.innerHTML = data.div;
                document.getElementById('gist' + id).appendChild(div);
            }
        });
    };
});