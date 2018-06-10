import Axios from 'axios';

export default Axios.create({
  baseURL: 'https://contactmanager.banlinea.com/api/'
});