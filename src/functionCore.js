module.exports = {
    getChatContainer: (commentOwnerId, image, name, text, commentId = 0, item, d, userId)=>{

        let time = d ? new Date(d) : new Date();
        const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric' }) 
        const [{ value: mo },,{ value: da },,{ value: ye },,{ value: hour },,{ value: minute },,{ value: second }] = dtf.formatToParts(time)
        time = `${da}-${mo}-${ye} ${hour}:${minute}:${second}`;
 
        return `<div class="chatcontainer remove-item ${item == "Messages" && "own-message"}">
        ${(!userId || commentOwnerId == userId)? ` <div class="post-options">
        <div class="dropdown">
            <a class="dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                ...
            </a>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="javascript:void(0)" onclick="removeItem('${item}', ${commentId}, this)">Delete</a>
            </div>
          </div>
            </div>` : ""}
        <a href="/profile?user=${commentOwnerId}">
            <img src="${image}" alt="Avatar" title="${name}">
        </a>
        <p>${text}</p>
        <span class="post-date">${time}</span>
        </div>`;
    }
}