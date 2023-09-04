class ChatUI{
	constructor(list){
		this.list=list
	}
	
	render(data){
		const html=`
		<li class="list-group-item">
			<span class="username">${data.username}:</span>
			<span class="message">${data.message}</span>
		</li>
		`;
		this.list.innerHTML+=html;
	}
}
export default ChatUI;
