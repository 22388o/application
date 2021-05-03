export function defaultTheme() {
  const mainColor = '#3949ab'
  const mainColorHover = '#354085'
  const appBG = '#000119'
  const bodyBGColor = '#000120'
  const mainTextColor = '#FFF'
  const transparent = 'transparent'
  const modalBG = '#181b37'
  const infoBG = '#282c47'
  const inputBG = '#181b37'
  const highlightColor = '#ffd149'
  const secondaryText = '#DDDDDD'

  return {
    //App
    appBGColor: appBG,
    appInfoBoxBG: infoBG,
    appInfoBoxTextColor: secondaryText,
    appBoxBG: inputBG,
    appBoxBorder: inputBG,
    appBoxHoverBG: inputBG,
    appBoxHoverBorder: inputBG,
    appBoxTextColor: mainTextColor,
    appBoxSecondaryBG: infoBG,
    appBoxSecondaryTextColor: mainTextColor,
    appBoxSecondaryInnerBG: inputBG,
    appBoxSecondaryInnerTextColor: secondaryText,
    appCurrencyInputBG: inputBG,
    appCurrencyInputTextColor: mainTextColor,
    appCurrencyInputBGHover: inputBG,
    appCurrencyInputTextColorHover: mainTextColor,
    appCurrencyInputBGActive: mainColor,
    appCurrencyInputTextColorActive: mainTextColor,
    appCurrencyInputBGActiveHover: mainColorHover,
    appCurrencyInputTextColorActiveHover: mainTextColor,

    //Buttons
    buttonBG: mainColor,
    buttonTextColor: mainTextColor,
    buttonBGHover: mainColorHover,
    buttonTextColorHover: mainTextColor,
    buttonBGActive: mainColorHover,
    buttonTextColorActive: mainTextColor,
    buttonBGActiveHover: mainColorHover,
    buttonTextColorActiveHover: mainTextColor,
    buttonBGDisabled: mainColor,
    buttonTextColorDisabled: mainTextColor,
    buttonNavigationBG: mainColor,
    buttonNavigationTextColor: secondaryText,
    buttonNavigationBGHover: modalBG,
    buttonNavigationTextColorHover: secondaryText,
    buttonSelectBG: mainColor,
    buttonSelectTextColor: mainTextColor,
    buttonSelectBGHover: mainColorHover,
    buttonSelectTextColorHover: mainTextColor,
    buttonSelectBGActive: mainColor,
    buttonSelectTextColorActive: mainTextColor,
    buttonSelectBGActiveHover: mainColorHover,
    buttonSelectTextColorActiveHover: mainTextColor,
    buttonSecondaryBG: mainColor,
    buttonSecondaryBorder: transparent,
    buttonSecondaryTextColor: mainTextColor,
    buttonSecondaryBGActive: mainColor,
    buttonSecondaryBorderActive: mainColor,
    buttonSecondaryTextColorActive: secondaryText,
    buttonSecondaryBGHover: mainColorHover,
    buttonSecondaryBorderHover: mainColor,
    buttonSecondaryTextColorHover: secondaryText,
    buttonOutlinedBorder: '#2c2f36',
    buttonOutlinedTextColor: mainTextColor,
    buttonOutlinedBorderHover: '#5g656d',
    buttonOutlinedTextColorHover: mainTextColor,

    //Footer
    footerBG: bodyBGColor,
    footerTextColor: mainTextColor,

    //Global
    bodyBG: bodyBGColor,
    bodyBGTablet: bodyBGColor,
    bodyBGMobile: bodyBGColor,
    layerBG: 'radial-gradient(50% 50% at 50% 50%, rgb(41, 44, 71) 0%, rgb(0, 1, 32) 100%)',
    layerBGTablet: 'radial-gradient(50% 50% at 50% 50%, rgb(41, 44, 71) 0%, rgb(0, 1, 32) 100%)',
    layerBGMobile: 'radial-gradient(50% 50% at 50% 50%, rgb(41, 44, 71) 0%, rgb(0, 1, 32) 100%)',
    bodyBGColor: bodyBGColor,
    borderRadius: '6px',
    linkColor: mainColor,
    linkColorHover: mainColor,
    lineColor: '#5F656D',
    logoFilter: 'none',
    logo: '',

    //Header
    headerBG: transparent,
    headerTextColor: mainTextColor,
    headerButtonBG: mainColor,
    headerButtonBGHover: mainColorHover,
    headerButtonIconColor: mainTextColor,
    headerModalTextColor: mainTextColor,
    headerModalTextHighlight: mainColor,

    //Modal
    modalBG: bodyBGColor,
    modalBorder: bodyBGColor,
    modalSecondaryBG: modalBG,
    modalLines: mainColor,
    modalButtonBG: '#2c2f36',
    modalButtonText: mainTextColor,
    modalShadow: 'rgba(0,0,0,.425)',
    modalInputBG: transparent,
    modalInputBorder: mainColor,
    modalInputBorderFocus: mainColor,
    modalFooterBG: appBG,

    //Navigation
    navigationBG: appBG,
    navigationTabBG: transparent,
    navigationTabIconColor: highlightColor,
    navigationTabBGHover: 'rgba(41, 91, 219, .5)',
    navigationTabIconColorHover: mainTextColor,
    navigationTabBGActive: inputBG,
    navigationTabIconColorActive: mainTextColor,
    navigationTabModalBG: modalBG,
    navigationTabModalText: mainTextColor,
    navigationTabModalHover: '#2c2f36',

    //Text
    textHighlight: highlightColor,
    textPrimary: mainTextColor,
    textSecondary: secondaryText,
    textTertiary: '#BEBEBE',
    textDisabled: '#565A69',

    //States
    red1: '#FF6871',
    red2: '#F82D3A',
    green1: '#27AE60',
    yellow1: '#FFE270',
    yellow2: '#F3841E'
  }
}
