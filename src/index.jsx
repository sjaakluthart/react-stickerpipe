/* eslint no-console: ["error", { allow: ["error"] }] */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import onClickOutside from 'react-onclickoutside';
import EventListener from 'react-event-listener';
import StickerPipeClient from './client';
import Storage from './storage';
import MyStickerPacks from './components/my-sticker-packs';
import StickerPack from './components/sticker-pack';
import StickerShop from './components/sticker-shop';
import parseResponse from './parse-response';
import defaultColors from './default-colors';

class StickerMenu extends Component {
  static propTypes = {
    apiKey: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    sendSticker: PropTypes.func.isRequired,
    toggleButton: PropTypes.element,
    colors: PropTypes.shape({
      primary: PropTypes.string,
      secondary: PropTypes.string
    }),
    /** Toggle the StickerMenu's visibility */
    open: PropTypes.bool,
    /** Function to hide the menu */
    hideMenu: PropTypes.func.isRequired,
  }

  static defaultProps = {
    colors: defaultColors,
    toggleButton: null,
    open: false
  }

  static childContextTypes = {
    client: PropTypes.shape({
      getMyPacks: PropTypes.func.isRequired,
      purchasePack: PropTypes.func.isRequired
    }).isRequired,
    storage: PropTypes.shape({
      storePack: PropTypes.func.isRequired,
      getPack: PropTypes.func.isRequired
    }).isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      stickerPacks: [],
      pack: {},
      shop: false
    };

    this.client = new StickerPipeClient(props.apiKey, props.userId, 'https://api.stickerpipe.com/api/v2');
    this.storage = new Storage(props.userId);

    this.getMyPacks = this.getMyPacks.bind(this);
    this.showPack = this.showPack.bind(this);
    this.toggleShop = this.toggleShop.bind(this);
  }

  getChildContext() {
    return {
      client: this.client,
      storage: this.storage
    };
  }

  componentDidMount() {
    this.getMyPacks(this.showPack);
  }

  getMyPacks(callback) {
    const storedPacks = this.storage.getMyPacks();

    if (storedPacks && storedPacks.length > 0) {
      if (callback) {
        callback(storedPacks[0].pack_name);
      }

      this.setState({
        stickerPacks: storedPacks
      });

      return false;
    }

    this.client.getMyPacks((err, res) => {
      if (err) {
        console.error(err);

        return false;
      }

      const stickerPacks = parseResponse(res);

      if (callback) {
        callback(stickerPacks[0].pack_name);
      }

      this.storage.storeMyPacks(stickerPacks);

      this.setState({
        stickerPacks
      });

      return false;
    });

    return false;
  }

  showPack(packName) {
    const { client, storage } = this;

    const storedPack = storage.getPack(packName);

    if (storedPack) {
      this.setState({
        pack: storedPack,
        shop: false
      });

      return false;
    }

    client.purchasePack(packName, (err, res) => {
      if (err) {
        console.error(err);

        return false;
      }

      const pack = parseResponse(res);

      storage.storePack(pack.pack_name, pack.title, pack.stickers);

      this.setState({
        pack,
        shop: false
      });

      return false;
    });

    return false;
  }

  toggleShop() {
    this.setState({
      shop: !this.state.shop
    });
  }

  handleClickOutside = (event) => {
    const { hideMenu } = this.props;

    hideMenu(event);
  }

  handleKeyUp = (event) => {
    const { hideMenu } = this.props;

    if (event.which === 27) {
      hideMenu(event);
    }
  }

  render() {
    const {
      sendSticker,
      toggleButton,
      colors,
      open,
      eventTypes, // eslint-disable-line no-unused-vars, react/prop-types
      outsideClickIgnoreClass, // eslint-disable-line no-unused-vars, react/prop-types
      preventDefault, // eslint-disable-line no-unused-vars, react/prop-types
      stopPropagation, // eslint-disable-line no-unused-vars, react/prop-types
      disableOnClickOutside, // eslint-disable-line no-unused-vars, react/prop-types
      enableOnClickOutside, // eslint-disable-line no-unused-vars, react/prop-types
      hideMenu, // eslint-disable-line no-unused-vars
      apiKey, // eslint-disable-line no-unused-vars
      userId, // eslint-disable-line no-unused-vars
      ...custom
    } = this.props;
    const { stickerPacks, pack, shop } = this.state;

    if (!open) {
      return false;
    }

    const mergedColors = Object.assign(defaultColors, colors);

    return (
      <section className="sticker-menu" {...custom}>
        {toggleButton ? <header>{toggleButton}</header> : null}
        {
          (pack && pack.stickers) && !shop
          ? <StickerPack pack={pack} sendSticker={sendSticker} />
          : null
        }
        {shop ? <StickerShop getMyPacks={this.getMyPacks} colors={mergedColors} /> : null}
        <MyStickerPacks
          stickerPacks={stickerPacks}
          showPack={this.showPack}
          toggleShop={this.toggleShop}
          shop={shop}
          colors={mergedColors}
        />
        <EventListener target="window" onKeyUp={this.handleKeyUp} />
      </section>
    );
  }
}

export default onClickOutside(StickerMenu);
