//modified from https://stackoverflow.com/questions/2153917/how-to-send-a-put-delete-request-in-jquery
//edit args to take in the url!! ie one for people, one for abilities etc.
//location is the location ie /people/
function deletion(id, location){
    $.ajax({
        url: '/' + location + '/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
function deletionPA(pid, aid, location){
    $.ajax({
        url: '/' + location + '/' + pid + '/' + aid,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
