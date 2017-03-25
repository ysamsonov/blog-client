import React from "react";
import {browserHistory} from "react-router";
import {Row, Col, Grid, Button, ButtonGroup} from 'react-bootstrap';
import Api from "../api/Api";
import UserInfo from "./UserInfo";
import InfiniteScroll from 'react-infinite-scroller';
import TokenService from "../api/TokenService";
import UserProfileMenu from "./UserProfileMenu";
import Field from "../app/Field";
import ArticlePreview from "../article/ArticlePreview";

export default class UserProfile extends React.Component {

    constructor(props) {
        super(props);
        this.api = Api.getDefault();
        this.tokenService = new TokenService();
        this.state = {
            page: 0,
            author: null,
            status: this.props.params.status !== undefined ? this.props.params.status : "PUBLISHED", //@TODO
            articles: [],
            hasMore: true,
        };
        this.api.account.getById(this.props.params.userId).execute({
            success: ((body) => {
                console.log('success');
                console.log(body);
                this.setState({
                    author: body.data.result,
                })
            }),
            error: ((body) => {
                console.error('error');
                console.error(body);
                this.setState({
                    author: "not found",
                    hasMore: false,
                })
            })
        });

        this.loadItems = this.loadItems.bind(this);
        this.settings = this.settings.bind(this);
        this.deleteOnClick = this.deleteOnClick.bind(this);
    }

    loadItems() {
        let data = {
            "page": this.state.page,
            "limit": 4,
            "status": this.state.status,
            "authorId": this.props.params.userId,
            "orderBy": "creationDate:desc",
        };
        this.api.article.list(data).execute({
            success: ((body) => {
                console.log('success');
                console.log(body);
                if (body.data.result.length === 0) {
                    this.setState({
                        hasMore: false,
                    });
                } else {
                    this.setState({
                        page: this.state.page + 1,
                        articles: this.state.articles.concat(body.data.result),
                    })
                }
            }),
            error: ((body) => {
                console.error('error');
                console.error(body);
            })
        });
    }

    settings(type) {
        this.setState({
            page: 0,
            articles: [],
            status: type,
            hasMore: true,
        });
    }

    getUserProfileMenu() {
        if (this.tokenService.isTokenExist() && (this.tokenService.getId() === this.props.params.userId)) {
            return <UserProfileMenu settings={this.settings}/>;
        } else {
            return null;
        }
    }

    deleteOnClick() {
        this.api.account.remove(this.props.params.userId).execute({
            success: ((body) => {
                console.log('success');
                console.log(body);
                browserHistory.push('/');
            }),
            error: ((body) => {
                console.error('error');
                console.error(body);
            })
        });
    }

    getAdminMenu() {
        if (this.tokenService.isTokenExist()) {
            let roles = JSON.parse(localStorage.getItem('roles'));
            console.log(roles);
            for (let i = 0; i < roles.length; i++) {
                console.log(roles[i]);
                if (roles[i] === "ROLE_ADMIN" || roles[i] === "ROLE_MODERATOR") {
                    return <Button block bsSize="sm" bsStyle="danger" onClick={this.deleteOnClick}
                                   className="delete-btn">Удалить пользователя</Button>;
                }
            }
        } else {
            return null;
        }
    }

    getUserInfo() {
        if (this.state.author === "not found") {
            return <h2>Страница удалена либо ещё не создана.</h2>;
        } else if (this.state.author !== null) {
            return <UserInfo info={this.state.author}/>;
        }
    }

    render() {
        let articles = this.state.articles;
        let standardArticles = [];
        for (let i = 0; i < articles.length; i++) {
            standardArticles.push(<ArticlePreview key={articles[i].id} data={articles[i]} size="max"/>);
        }

        return (
            <div className="wrap">
                <Grid className="main">
                    <Row>
                        <Col lg={3} md={3} sm={12} xs={12}>
                            <div className="profile">
                                {this.getUserInfo()}
                                {this.getUserProfileMenu()}
                                {this.getAdminMenu()}
                            </div>
                        </Col>

                        <Col lg={9} md={9} sm={12} xs={12}>
                            <Row>
                                {this.state.author === null ? null : <InfiniteScroll
                                        pageStart={0}
                                        loadMore={this.loadItems}
                                        hasMore={this.state.hasMore}
                                        loader={
                                            <div>
                                                <span className="loader">
                                                    <span></span>
                                                </span>
                                                Loading ...
                                            </div>
                                        }
                                    >
                                        {standardArticles.length === 0 ?
                                            <Field key="emptyField" text="Нет статей"/> : standardArticles}
                                    </InfiniteScroll>}
                            </Row>
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
};