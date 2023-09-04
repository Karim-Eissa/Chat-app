import {initializeApp} from 'firebase/app'
import firebaseConfig from './firebase';
import {
	getFirestore, collection,
	serverTimestamp,addDoc, onSnapshot,
	query,where,orderBy,getDocs,deleteDoc
} from 'firebase/firestore'

initializeApp(firebaseConfig)
const db=getFirestore()

class Chatroom{
	constructor(room,username){
		this.room=room
		this.username=username
		this.chats=collection(db,'chats');
		this.unsub;
	}
	async addChat(message){
		const expiration = new Date();
		expiration.setHours(expiration.getHours() + 1); // Add one hour to the current time
		const chat={
			message,
			username:this.username,
			room:this.room,
			created_at: serverTimestamp(),
			expirationTimestamp: expiration.getTime()
		};
		const response= await addDoc(this.chats,chat)
		return response;
	}
	getChats(callback){
		const messagesQuery = query(this.chats, 
			where('room', '==', this.room),
			orderBy('created_at')
			);
		this.unsub=onSnapshot(messagesQuery,(snapshot)=>{
			snapshot.docChanges().forEach((change) => {
				if (change.type === 'added') {
				  callback(change.doc.data());
				}
			  });
		})
	}
	unsubscribe() {
		if (this.unsub) {
		  this.unsub();
		}
	  }
	updateUser(username){
		this.username=username;
	}
	updateRoom(room){
		this.room=room;
		if(this.unsub){
			this.unsub();
		}
	}
	deleteExpiredChats = async () => {
		const expiredChatsQuery = query(this.chats, where('expirationTimestamp', '<=', Date.now()));
		const expiredChatsSnapshot = await getDocs(expiredChatsQuery);
	  
		expiredChatsSnapshot.forEach((doc) => {
		  deleteDoc(doc.ref);
		});
	  };

	async deleteAllChats() {
	try {
		const allChatsQuery = query(this.chats); // Query all chats
		const allChatsSnapshot = await getDocs(allChatsQuery);
		console.log("Total documents:", allChatsSnapshot.size); // Debugging
		allChatsSnapshot.forEach(async (doc) => {
		await deleteDoc(doc.ref);
		});
		setTimeout(() => {
			location.reload();
		  }, 1000);
	} catch (error) {
		console.error('Error deleting chats:', error);
	}
	}
}
export default Chatroom;
