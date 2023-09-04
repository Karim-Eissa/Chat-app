import { getAuth, createUserWithEmailAndPassword, 
	signInWithEmailAndPassword, updateProfile,signOut, onAuthStateChanged
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebase';
import Chatroom from './chat';
import ChatUI from './ui';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const chatList=document.querySelector('.chat-list')
const newChatForm=document.querySelector('.new-chat')
const logoutButton=document.querySelector('#logout')
const signupForm = document.getElementById('modal-signup');
const loginForm = document.getElementById('modal-login');
const loggedIn=document.querySelectorAll('.logged-in')
const loggedOut=document.querySelectorAll('.logged-out')
const accountDetails = document.querySelector('.account-details');
const loggedInName=document.querySelector('.loggedInName')
const loginError=document.querySelector('.loginError')
const signupError=document.querySelector('.signupError')
const deleteChats = document.getElementById('delete-all-chats');
const reloadButton = document.querySelector('#reload-button');


const chatUI = new ChatUI(chatList);
const chatroom = new Chatroom();

const deleteAllChatsButton = document.querySelector('#delete-all-chats');
deleteAllChatsButton.addEventListener('click', () => {
  chatroom.deleteAllChats();
});

//signup
signupForm.addEventListener('submit', async(e) => {
	e.preventDefault();
	const name = signupForm.querySelector('#name').value;
	const email = signupForm.querySelector('#email').value;
	const password = signupForm.querySelector('#password').value;
  
	// Create user with email and password
	createUserWithEmailAndPassword(auth, email, password)
	  .then((userCredential) => {
		// Update user profile with display name
		return updateProfile(userCredential.user, {
		  displayName: name
		});
	  })
	  .then(() => {
		const modal = document.querySelector('#modal-signup')
		M.Modal.getInstance(modal).close();
		setTimeout(() => {
			window.location.reload();
		  }, 500);
		signupForm.reset();
		signupError.innerHTML = '';
		})
	  .catch((error) => {
		signupError.innerHTML = error.message.substring(10);
	  });
  });

// Logout
logoutButton.addEventListener('click', async () => {
	const shouldLogout = confirm('Are you sure you want to logout?');
	if (shouldLogout) {
	  try {
		await signOut(auth);
		console.log('User logged out successfully');
	  } catch (error) {
		console.log('Error signing out:', error.message);
	  }
	}
  }); 

// Login
loginForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const email = loginForm.querySelector('#email').value;
	const password = loginForm.querySelector('#password').value;
	// Sign in with email and password
	signInWithEmailAndPassword(auth, email, password)
	.then(()=>{
		const modal=document.querySelector('#modal-login')
		M.Modal.getInstance(modal).close()
		setTimeout(() => {
			window.location.reload();
		  }, 1500);
		  loginError.innerHTML='';
	})
	.catch((err)=>{
		console.log('Error logging in:', err.message); // Debugging
		loginError.innerHTML=err.message.substring(10)
	})
  });

  onAuthStateChanged(auth, (user) => {
	if (user) {
	  setupUi(user);
	  newChatForm.addEventListener('submit', (e) => {
		e.preventDefault();
		const message = newChatForm.message.value.trim();
		chatroom.addChat(message)
		.then(() => newChatForm.reset())
		.catch((err) => console.log(err));
		chatList.scrollTop = chatList.scrollHeight;
	  });
	  chatroom.updateUser(user.displayName);
	  chatroom.updateRoom('general');
	  chatroom.getChats((data) => {
	  	chatUI.render(data)
		chatList.scrollTop = chatList.scrollHeight;
	})
	} else {
	  chatroom.unsubscribe();
	  setupUi();
	}
  });

  const setupUi=(user)=>{
	if(user){
		// account info
		
		const html = `
		<div>Logged in as ${user.email}</div>
		<div>Username: ${user.displayName}</div>
		`;
		if(user.email==='karimeissa20042004@gmail.com'){
			deleteChats.style.display='inline-block';
			user.displayName=`<span class="adminn">Admin</span>`
		}
		let userName=user.displayName;
		loggedInName.innerHTML=userName;
		accountDetails.innerHTML = html;
		loggedIn.forEach(loggedinLink=>loggedinLink.style.display='block')
		loggedOut.forEach(loggedoutLink=>loggedoutLink.style.display='none')
		
	}else{
		accountDetails.innerHTML = '';
		loggedIn.forEach(loggedinLink=>loggedinLink.style.display='none')
		loggedOut.forEach(loggedoutLink=>loggedoutLink.style.display='block')
	}
}
// setup materialize components
document.addEventListener('DOMContentLoaded', function() {
	var modals = document.querySelectorAll('.modal');
	M.Modal.init(modals);
	var items = document.querySelectorAll('.collapsible');
	M.Collapsible.init(items);
  });

  setInterval(() => {
	chatroom.deleteExpiredChats();
  }, 60 * 60 * 1000);

