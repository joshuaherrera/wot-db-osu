//modified from https://stackoverflow.com/questions/9436534/ajax-tutorial-for-post-and-get
//location is part of url and handle is the page rendered by handlebars
function update(id, location, handle){
    $.ajax({
        url: '/' + location + '/' + id,
        type: 'POST',
        data: $('#' + handle).serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};