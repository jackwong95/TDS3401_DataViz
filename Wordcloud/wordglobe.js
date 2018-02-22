
function create_wordglobe(data, globe_options)
{
    var end_idx = (data.length > globe_options.show)?globe_options.show:data.length;
    data = data.slice(0, end_idx);

    var parentNode = document.getElementById(globe_options.list_id);
    var child = parentNode.firstChild;

    while(child) {
        parentNode.removeChild(child);
        child = parentNode.firstChild;
    }


    function createNewListItem(parentNode, text)
    {
        var list_item = document.createElement("li");
        parentNode.appendChild(list_item);

        var word = document.createElement("a");
        word.innerHTML = text;
        word.setAttribute("class", "globe_text");
        word.addEventListener("click", globe_options.onclick);
        list_item.appendChild(word);

        return word;
    }

    for (var key in data)
    {
        createNewListItem(parentNode, data[key][0]);
    }

    $(globe_options.div_id).tagoSphere(globe_options.globe_settings);
}