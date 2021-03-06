import React from 'react';
import ProductThumb from 'components/main/products/product-thumb';
import LatestProductsStore from 'stores/latest-products';
import ProductActions from 'actions/product';

export default class Latest extends React.Component {
  constructor() {
    this.onLoadLatest = this.onLoadLatest.bind(this);
    this.state = {
      latestProducts: []
    };
  }

  onLoadLatest(latestProducts) {
    //при загрузке товаров изменяем состояние компонента
    this.setState({ latestProducts });
  }

  componentDidMount() {
    //слушаем изменения в хранилище последних товаров
    this.unsubscribe = LatestProductsStore.listen(this.onLoadLatest);
    //загружаем последние товары
    ProductActions.loadLatest();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render () {
    let latestProducts = this.state.latestProducts;
    //отображение списка товаров
    let latestProductsMap = latestProducts.map(product => {
      return <ProductThumb product={ product } key={ product.id } />;
    })
    return (
      <div className="panel panel-info">
        <div className="panel-heading">
          Новинки
        </div>
        <div className="panel-body">
          { latestProductsMap }
        </div>
      </div>
    )
  }
}
