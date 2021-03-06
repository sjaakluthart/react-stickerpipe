import React from 'react';
import PropTypes from 'prop-types';
import Sticker from './sticker';
import IconAdd from './icons/icon-add';

function MyStickerPacks({ stickerPacks, shop, toggleShop, showPack, colors }) {
  const style = {
    stickers: {
      minWidth: `${stickerPacks.length * 48}px`
    }
  };

  return (
    <section className="my-packs">
      <section className="pack-list">
        <div className="stickers-tab">
          <div className="stickers" style={style.stickers}>
            {
              stickerPacks.length > 0
              ? stickerPacks.map(stickerPack => (
                <Sticker
                  key={`my-sticker-packs-${stickerPack.pack_name}`}
                  src={stickerPack.main_icon.mdpi}
                  onClick={() => showPack(stickerPack.pack_name)}
                />
              ))
              : <p>Loading...</p>
            }
          </div>
        </div>
        <div onClick={toggleShop} className="button-shop">
          <IconAdd color={shop ? colors.primary : null} />
        </div>
      </section>
    </section>
  );
}

MyStickerPacks.propTypes = {
  stickerPacks: PropTypes.arrayOf(PropTypes.shape({
    pack_name: PropTypes.string.isRequired,
    main_icon: PropTypes.shape({
      mdpi: PropTypes.string.isRequired,
      hdpi: PropTypes.string.isRequired,
      xhdpi: PropTypes.string.isRequired,
      xxhdpi: PropTypes.string.isRequired
    }).isRequired
  })).isRequired,
  showPack: PropTypes.func.isRequired,
  toggleShop: PropTypes.func.isRequired,
  shop: PropTypes.bool.isRequired,
  colors: PropTypes.shape({
    primary: PropTypes.string.isRequired
  }).isRequired
};

export default MyStickerPacks;
