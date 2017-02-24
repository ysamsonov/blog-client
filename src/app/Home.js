import React from "react";
import {Row, Grid} from 'react-bootstrap';
import ArticlePreview from "../article/ArticlePreview";
import InfiniteScroll from 'react-infinite-scroller';
import Api from "../api/Api";
import Field from "./Field";

export default class Home extends React.Component {

    constructor(props) {
        super(props);
        this.api = Api.getDefault();
        this.state = {
            page: 0,
            articles: [],
            hasMore: true,
        };
        this.loadItems = this.loadItems.bind(this);
    }

    loadItems() {
        let data = {
            "page": this.state.page,
            "limit": 6
        };
        this.api.article.list(data).execute({
            success: ((body) => {
                console.log('success');
                console.log(body);
                if (body.data.result.length === 0) {
                    this.setState({
                        hasMore: false,
                    });
                    if (this.state.articles.length === 0) {
                        this.setState({
                            articles: this.state.articles.concat([<Field key="emptyField" text="Нет статей"/>]),
                        })
                    }
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


    render() {
        let articles = this.state.articles;
        let bigArticles = [];
        let standardArticles = [];
        if (articles.length !== 0 && articles[0].key !== "emptyField") {
            for (let i = 0; i < articles.length && i < 2; i++) {
                bigArticles.push(<ArticlePreview key={articles[i].id} size="big" data={articles[i]}/>);
            }
            for (let i = 2; i < articles.length; i++) {
                standardArticles.push(<ArticlePreview key={articles[i].id} data={articles[i]}/>);
            }
        } else {
            bigArticles.push(articles[0]);
        }


        return (
            <div className="wrap">
                <Grid className="main">
                    <Row>
                        {bigArticles}
                    </Row>
                    <Row>
                        <InfiniteScroll
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
                            {standardArticles}
                        </InfiniteScroll>
                    </Row>
                </Grid>
            </div>
        );
    }
}
