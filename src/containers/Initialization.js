import React from 'react';
import axios from 'axios'
import { connect } from 'react-redux';
import { 
  fetchInitialUserData,
  storeUserToken, 
  storeUserSaves, 
  appendUserSaves,
  setPagination
} from '../actions/index.js'

class Initialization extends React.Component {
  componentDidMount (props) {
    const params = new URLSearchParams(this.props.location.hash);
    const token = params.get('#access_token')
    this.props.storeUserToken(token)
    this.props.fetchInitialUserData(token)
  }

  componentDidUpdate () {
    if (this.props.runAutoPagination === true && this.props.username !== null) {
      this.runAutoPagination()
      this.props.setPagination(false)
    }
  }

  // I keep track of the number of user saves on a page with userSaves. I get the next page of saves, dispatch an action to store that page, which is fed back to the while loop; and append that next page to an array holding all saves.
  async runAutoPagination () {
    while (this.props.userSaves.length > 0) {
      const lastPage = this.props.userSaves[this.props.userSaves.length-1].data.name
      const userSavesObject = await axios.get (`https://oauth.reddit.com/user/${this.props.username}/saved/.json?limit=100&after=${lastPage}`, {
      headers: { 'Authorization': `bearer ${this.props.token}` }
    })
      const currentPageSaves = userSavesObject.data.data.children
      this.props.storeUserSaves(currentPageSaves)
      this.props.appendUserSaves(currentPageSaves)
    }
  }
  render () {
    return null
  }
}

const mapStateToProps = state => {
  return { 
    username: state.userData.username,
    userSaves: state.userData.userSaves,
    runAutoPagination: state.pagination.runAutoPagination,
    token: state.userData.token
   }
}

export default connect(mapStateToProps, { 
  fetchInitialUserData,
  storeUserToken, 
  storeUserSaves, 
  appendUserSaves,
  setPagination })(Initialization);