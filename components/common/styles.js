
export const colors = {
    headerTitleColor:'white',
    primary: 'blue',
    blue: 'blue',
    purple08: 'rgba(17, 40, 120, 0.8)',
    purple02: 'rgba(17, 40, 120, 0.2)',
    purple1: 'rgba(17, 40, 120, 1)',
    
    darkBlue: "#112878",
    secondary: '#7CFC00',
    accennt: 'purple',
    buttonBackgroundColor: 'rgba(17, 40, 120, 0.6)',
    buttonTextColor: 'white',
    white: 'white',
}

//export const backgroundImage =require( '../../assets/back.png');
 //export const backgroundImage =require( '../../assets/back1.jpg');
 //export const backgroundImage =require( '../../assets/back2.jpg');
 //export const backgroundImage =require( '../../assets/beautifulblue.jpg');
 export const 
 backgroundImage =require( '../../assets/panamea.jpg');


export const commonStyles = {
  containerCommon: {
    //backgroundColor: 'rgba(124, 252, 0, 0.1)'
    //backgroundColor: 'rgba(0, 0, 255, 0.2)', // Blue with 10% opacity
    //backgroundColor: 'blue', // Set the background color to blue
  },
  text:{   fontFamily: 'opensans-regular',
  fontSize: 16,
  color: '#333', // Default text color
  textAlign:'center'

  },
    textWithBackground: {
        fontFamily: 'opensans-regular',
        fontSize: 16,
        color: 'white', // Default text color
        textAlign:'center',
        backgroundColor:'rgba(17, 40, 120, 0.5)',
        borderRadius:10,
        padding:4,
        margin:-3
    },
    blackText: {
      fontFamily: 'opensans-regular',
      fontSize: 16,
      color: 'white', // Default text color
  },
    boldText: {



        fontFamily: 'opensans-bold',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333', // Default text colorr
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    input: {
      width: 200,
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      marginBottom: 20,
    },
    addButton: {
      backgroundColor: colors.buttonBackgroundColor,
      padding: 10,
      borderRadius: 8,
    },
    addButtonText: {
      color: colors.buttonTextColor,
      fontSize: 16,
      fontWeight: 'bold',
    },
    weightInfoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 20,
    },
    weightInfoItem: {
      alignItems: 'center',
    },
    weightInfoLabel: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 5,
      marginLeft: -4,
      marginRight: 9,
    },
    weightInfoValue: {
      fontSize: 18,
      fontWeight: '500',
    },
  };