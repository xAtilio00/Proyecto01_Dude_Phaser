import Phaser from 'phaser'
import game from './game'


//
const config = { //Establece la configuración del juego
	type: Phaser.AUTO, //Permitirá usar Canvas.
	width: 800, //Ancho de la pantalla del juego
	height: 600, //Alto de la pantalla del juego
	physics: { //Físicas del juego
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene: [game] //Escenas del juego
}

export default new Phaser.Game(config) //Variable que tendrá la configuración del juego