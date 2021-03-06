import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LayoutHeader from '../common/LayoutHeader';
import BookGrid from '../common/BookGrid';
import {
  fetchBooks,
  clearAllBookState
} from '../actions/loadBooks';
import { logout } from '../actions/login';
import BreadCrumbs from '../common/BreadCrumbs';

import LoadingPage from './LoadingPage';

export class ViewAllBooks extends React.Component {
  constructor(props) {
    super(props);
    const pageLinks = [];
    this.timeOutClear = null;

    pageLinks.push({
      linkName: 'Home',
      link: ''
    });
    pageLinks.push({
      linkName: 'Library',
      link: 'books'
    });

    this.state = {
      limit: 10,
      page: 1,
      totalBooks: 0,
      totalPages: 1,
      sort: 'newest',
      allBooks: [],
      pageLinks
    };
  }
  componentDidMount() {
    this.fetchAll();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.error && nextProps.error.status === 504) {
      // reload on timeout failure
      if (!this.timeOutClear) {
        this.timeOutClear =
          window
            .setInterval(this.refreshOnTimeOutError, 10000);
      }
    } else if (nextProps.error &&
      nextProps.error.message) {
      this.props.logout();
      this.context.router.history.push('/signin');
    } else {
      window.clearInterval(this.timeOutClear);
      this.setState({
        totalBooks: nextProps.totalBooks,
        totalPages: nextProps.totalPages
      });
    }
  }
  componentWillUnmount() {
    window.clearInterval(this.timeOutClear);
    this.props.clearAllBookState();
  }
  refreshOnTimeOutError = () => {
    this.fetchAll();
  }
  fetchAll = () => {
    this.props.fetchBooks(
      this.state.page,
      this.state.limit,
      this.state.sort
    );
  }
  sortFunction = (event, index) => {
    event.preventDefault();
    if (index !== this.state.sort) {
      this.setState({
        sort: index
      }, () => {
        this.fetchAll();
      });
    }
  }
  paginationFunction = (event, index) => {
    event.preventDefault();
    if (index !== this.state.page) {
      this.setState({
        page: index
      }, () => {
        this.fetchAll();
      });
    }
  }
  perPageFunction = (event, index) => {
    event.preventDefault();
    if (index !== this.state.limit) {
      this.setState({
        page: 1,
        limit: index
      }, () => {
        this.fetchAll();
      });
    }
  }
  emptyFunction = (event) => {
    event.preventDefault();
    return 1;
  }
  render() {
    if (!this.props.allBooks) {
      return (
        <LoadingPage />
      );
    }
    const { totalBooks, allBooks } = this.props;
    const { page,
      totalPages,
      limit,
      pageLinks, sort } = this.state;
    return (
      <div className="layout--container">

        <LayoutHeader
          headerTitle="Library"
        />
        <BreadCrumbs
          breadCrumbLinks={pageLinks}
        />
        <BookGrid
          removeFromCategory={this.emptyFunction}
          limit={limit}
          page={page}
          totalPages={totalPages}
          totalBooks={totalBooks}
          allBooks={allBooks}
          perPageFunction={this.perPageFunction}
          paginationFunction={this.paginationFunction}
          sortFunction={this.sortFunction}
          sort={sort}
          title="All Books In Library"
        />
      </div>
    );
  }
}
ViewAllBooks.propTypes = {
  allBooks: PropTypes.arrayOf(PropTypes.object),
  fetchBooks: PropTypes.func.isRequired,
  clearAllBookState: PropTypes.func.isRequired,
  totalBooks: PropTypes.number,
  totalPages: PropTypes.number,
  error: PropTypes.object,
  logout: PropTypes.func.isRequired,
};
ViewAllBooks.contextTypes = {
  router: PropTypes.object.isRequired,
};
ViewAllBooks.defaultProps = {
  totalBooks: 0,
  error: null,
  allBooks: null,
  totalPages: 0
};

/**
 * @param {object} state
 *
 * @returns {object} nextprops
 */
function mapStateToProps(state) {
  return {
    allBooks: state.bookReducer.fetchedBooks.bookLists,
    totalPages: state.bookReducer.fetchedBooks.totalPages,
    totalBooks: state.bookReducer.fetchedBooks.totalBooksCount,
    error: state.bookReducer.error
  };
}

export default connect(mapStateToProps, {
  fetchBooks,
  clearAllBookState,
  logout
})(ViewAllBooks);
