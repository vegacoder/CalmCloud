import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply, faTrash } from '@fortawesome/free-solid-svg-icons';
import CommentText from "./comment_text";

class Comment extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showNestedInput: false,
            nestedCommentText: "",
        };
        this.handleCommentContent = this.handleCommentContent.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSubmitNestedComment = this.handleSubmitNestedComment.bind(this);
        this._loading = React.createRef();
    }

    handleCommentContent(comment) {

        return (
            <>
                <Link to={`/${this.props.commentUsers[comment.user_id].username}`} className="comment-avatar">
                    <img src={(this.props.commentUsers[comment.user_id].userPictureUrl || window.defaultAvatar)} />
                </Link>

                <div className="comment-show-header">
                    <Link to={`/${this.props.commentUsers[comment.user_id].username}`} className={`comment-header-display-name${comment.user_id === this.props.track.user_id ? "-uploader" : ""}`}>
                        {this.props.commentUsers[comment.user_id].display_name}
                    </Link>
                    <span>{ this.formatDate(comment.created_at) }</span>
                </div>

                <div className="comment-show-actions">
                    { !comment.parent_comment_id ? <FontAwesomeIcon icon={faReply} onClick={() => this.setState({ showNestedInput: !this.state.showNestedInput }) }/> : null }
                    { this.props.currentUser ? 
                        (comment.user_id === this.props.currentUser.id ?
                            <FontAwesomeIcon icon={faTrash} onClick={ () => { 
                            this._loading.style.display = ""
                            this.handleDelete(comment.id, comment.user_id)
                            }}/> : null) : null }
                </div>
                
                <CommentText
                    mainComment={this.props.comment}
                    comment={comment}
                />
            </>
        )
    }

    formatDate(date) {
        const uploadDate = new Date(date);
        const nowDate = new Date();
        const secondsSince = ((nowDate - uploadDate) / 1000);

        if (secondsSince < 1) return `just now`;
        if ((secondsSince >= 1) && (secondsSince < 2)) return `1 sec ago`;
        if (secondsSince < 60) return `${Math.floor(secondsSince)} secs ago`;

        if ((secondsSince >= 60) && (secondsSince < 120)) return `1 min ago`;
        if (secondsSince < 3600) return `${Math.floor(secondsSince / 60)} mins ago`;

        if ((secondsSince >= 3600) && (secondsSince < 7200)) return `1 hr ago`;
        if (secondsSince < 86400) return `${Math.floor(secondsSince / 3600)} hrs ago`;

        if ((secondsSince >= 86400) && (secondsSince < 172800)) return `1 day ago`;
        if (secondsSince < 2592000) return `${Math.floor(secondsSince / 86400)} days ago`;

        if ((secondsSince >= 2592000) && (secondsSince < 5184000)) return `1 mo ago`;
        if (secondsSince < 31104000) return `${Math.floor(secondsSince / 2592000)} mos ago`;

        if ((secondsSince >= 31104000) && (secondsSince < 62208000)) return `1 yr ago`;
        if (secondsSince > 31104000) return `${Math.floor(secondsSince / 31104000)} yrs ago`;
    }


    handleNestedComment(e) {
        this.setState({
            nestedCommentText: e.currentTarget.value
        });
    }

    handleDelete(commentId, userId) {
        if (this.props.currentUser.id === userId) {
            this.props.deleteComment(commentId).then(id => {
                this._loading.style.display = "none";
                this.props.fetchTrack(this.props.match.params.username, this.props.match.params.title);
                this.props.fetchCurrentUser(this.props.currentUser.username);
            })
        } 
    }

    handleSubmitNestedComment(e) {
        e.preventDefault();
        if ((this.state.nestedCommentText.length > 0) && (this.props.currentUser !== null)) {
            this.props.createComment({
                body: this.state.nestedCommentText,
                track_id: this.props.track.id,
                parent_comment_id: this.props.comment.id,
            }).then((trackId) => {
                if (this.props.track.id === trackId) {
                    this.setState({
                        showNestedInput: false,
                        nestedCommentText: "",
                    })
                    this._loading.style.display = "none"
                    this.props.fetchTrack(this.props.match.params.username, this.props.match.params.title);
                    this.props.fetchCurrentUser(this.props.currentUser.username);
                }
            })
        }

    }

    render() {
        return (
            <div className="comment-show-container" style={{ paddingBottom: this.props.comment.childComments.length > 0 ? 0 : "" }}>
                { this.handleCommentContent(this.props.comment) }

                { this.state.showNestedInput ? 
                    <div className="comment-nested-input-container" style={{ paddingBottom: this.props.comment.childComments.length > 0 ? "20px" : 0 }}>
                        <div className="comment-nested-input">
                            <div className="comment-nested-avatar">
                                <img src={this.props.currentUser ? (this.props.currentUser.userPictureUrl || window.defaultAvatar) : window.commentAvatar} />
                            </div>
                            <form onSubmit={this.props.currentUser ? this.handleSubmitNestedComment : (e) => {
                                e.preventDefault();
                                this.props.openModal("login");
                            }} onKeyPress={(e) => {
                                if (e.target.className === "comment-input") {
                                    return;
                                }
                                (e.key === 'Enter') && e.preventDefault();
                            }}>
                                <textarea className="comment-input"
                                    maxLength="1000"
                                    value={this.state.commentText}
                                    onChange={e => this.handleNestedComment(e)}
                                />
                                <div className="comment-form-button-container">
                                    <input type="submit" value="Post Comment" 
                                        style={{ marginBottom: "20px" }}
                                        disabled={this.state.nestedCommentText.length === 0}
                                        onClick={() => this.props.currentUser ? this._loading.style.display = "" : null} />
                                </div>
                            </form>
                        </div>
                    </div> 
                    : null 
                }

                { this.props.comment.childComments.map(childId => {
                    const subComment = this.props.track.comments[childId];
                    return (
                        <div key={subComment.id} className="comment-show-container">
                            {this.handleCommentContent(subComment)}
                        </div>
                    )
                })
                }
                <div ref={(l) => this._loading = l} className="loading-spinner-background" style={{ display: "none" }}><div className="loading-spinner"><div></div><div></div><div></div><div></div></div></div>
            </div>
        )
    }
}

export default Comment;