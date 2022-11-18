import Phaser from 'phaser'
import ScoreLabel from './puntuacion'
import BombSpawner from './bombas'

const GROUND_KEY = 'ground'
const DUDE_KEY = 'dude'
const STAR_KEY = 'star'
const BOMB_KEY = 'bomb'

class GameScene extends Phaser.Scene
{
	//Resume las tareas de inicialización del proyecto
	constructor()
	{
		super('game-scene') //Identificador con el nombre de la escena
        this.player = undefined
        this.cursors = undefined
		this.scoreLabel = undefined
		this.stars = undefined
		this.bombSpawner = undefined
		this.gameOver = false
	}

	//Precarga todos los archivos que se utilizaran en la escena
	preload()
	{
		this.load.image('sky', 'assets/sky.png')
		this.load.image(GROUND_KEY, 'assets/platform.png')
		this.load.image(STAR_KEY, 'assets/star.png')
		this.load.image(BOMB_KEY, 'assets/bomb.png')

		this.load.spritesheet(DUDE_KEY, 
			'assets/dude.png',
			{ frameWidth: 32, frameHeight: 48 }
		)
	}

	//Se crean los componentes del escenario
	create()
	{
		this.add.image(400, 300, 'sky')
		//this.add.image(400, 300, 'star')
		
		const platforms = this.createPlatforms()
		this.player = this.createPlayer()
		this.stars = this.createStars()

		this.scoreLabel = this.createScoreLabel(16, 16, 0)

		this.bombSpawner = new BombSpawner(this, BOMB_KEY)
		const bombsGroup = this.bombSpawner.group

		this.physics.add.collider(this.player, platforms)
		this.physics.add.collider(this.stars, platforms)
		this.physics.add.collider(bombsGroup, platforms)
		this.physics.add.collider(this.player, bombsGroup, this.hitBomb, null, this)

		this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)

        this.cursors = this.input.keyboard.createCursorKeys()
	}

	//Método que se ejecutará de manera constante
    update()
	{
		if (this.gameOver)
		{
			return
		}

		if (this.cursors.left.isDown)
		{
			this.player.setVelocityX(-160)

			this.player.anims.play('left', true)
		}
		else if (this.cursors.right.isDown)
		{
			this.player.setVelocityX(160)

			this.player.anims.play('right', true)
		}
		else
		{
			this.player.setVelocityX(0)

			this.player.anims.play('turn')
		}

		if (this.cursors.up.isDown && this.player.body.touching.down)
		{
			this.player.setVelocityY(-330)
		}
	}

	//Se crean las plataformas del juego
	createPlatforms()
	{
		const platforms = this.physics.add.staticGroup()

		platforms.create(400, 568, GROUND_KEY).setScale(2).refreshBody()
	
		platforms.create(600, 400, GROUND_KEY)
		platforms.create(50, 250, GROUND_KEY)
		platforms.create(750, 220, GROUND_KEY)

		return platforms
	}

	//Método que crea al jugador
    createPlayer()
	{
		const player = this.physics.add.sprite(100, 450, DUDE_KEY)
		player.setBounce(0.2)
		player.setCollideWorldBounds(true)

		//Se le agrega animación de acuerdo a la dirección hacia donde se mueva
		this.anims.create({
			key: 'left',
			frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1
		})
		
		this.anims.create({
			key: 'turn',
			frames: [ { key: DUDE_KEY, frame: 4 } ],
			frameRate: 20
		})
		
		this.anims.create({
			key: 'right',
			frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1
		})

		return player
	}

	//Se crean las estrellas dentro del juego
	createStars()
	{
		const stars = this.physics.add.group({
			key: STAR_KEY,
			repeat: 11,
			setXY: { x: 12, y: 0, stepX: 70 }
		})
		
		stars.children.iterate((child) => {
			child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
		})

		return stars
	}
	
	//Método que determina cuando el jugador colisiona con la estrella
	collectStar(player, star)
	{
		star.disableBody(true, true)
		this.scoreLabel.add(10)

		if (this.stars.countActive(true) === 0)
		{
			//Cuando se collectan todas las estrellas se generan nuevamente
			this.stars.children.iterate((child) => {
				child.enableBody(true, child.x, 0, true, true)
			})
			this.bombSpawner.spawn(player.x) //Se spawnea una bomba
		}

	}

	//Se crea la puntuación que se mostrará en pantalla.
	createScoreLabel(x, y, score)
	{
		const style = { fontSize: '32px', fill: '#000' }
		const label = new ScoreLabel(this, x, y, score, style)

		this.add.existing(label)

		return label
	}

	//Método que determina cuando el jugador colisiona con la bomba
	hitBomb(player, bomb)
	{
		this.physics.pause()

		player.setTint(0xff0000)

		player.anims.play('turn')

		this.gameOver = true
	}
}
export default GameScene;