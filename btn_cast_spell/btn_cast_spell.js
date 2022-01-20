var total_attack = 0;
var isMagicReady = false;

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
    console.log(total_attack);
  }
  preload() {
    this.load.path = 'https://raw.githubusercontent.com/albert10jp/web_rpg/main/btn_cast_spell/assets/';
    this.load.spritesheet('cooldown_sheet', 'cooldown_sheet.png', { frameWidth: 48, frameHeight: 48 });
    this.load.image('magicAttack', 'magicAttack.png');
    this.load.atlas('bolt', 'bolt_atlas.png', 'bolt_atlas.json');

    // load brawler (player)
    this.load.spritesheet('brawler', 'brawler48x48.png', {
      frameWidth: 48, frameHeight: 48
    });

    // load frog (enemies)
    this.load.path = 'https://raw.githubusercontent.com/albert10jp/web_rpg/main/btn_cast_spell/assets/frog/';
    for (var i = 1; i < 3; i++) {
      this.load.image("frog_attack" + i, "frog" + i + ".gif");
    }
  }
  setupAnimation() {
    this.anims.create({
      key: 'frog_idle',
      frames: [
        { key: 'frog_attack1' },
        { key: 'frog_attack2' },
        { key: 'frog_attack1' },
      ],
      frameRate: 2,
      repeat: 1
    });

    this.anims.create({
      key: 'player_attack',
      frames: this.anims.generateFrameNumbers(
        'brawler', { frames: [30, 31, 30] }),
      frameRate: 2,
      repeat: 0,
    });

    this.anims.create({
      key: 'magic_effect',
      frames: this.anims.generateFrameNames('bolt', {
        // frames: [0, 1, 2, 3, 4, 5, 6, 7]
        // prefix: 'bolt_ball_', start: 1, end: 10, zeroPad: 4
        prefix: 'bolt_sizzle_', start: 1, end: 10, zeroPad: 4
      }),
      frameRate: 12,
      repeat: 0,
    });

    this.anims.create({
      key: 'cooldown_animation',
      frames: this.anims.generateFrameNumbers('cooldown_sheet', { start: 0, end: 15 }),
      frameRate: 6,
      repeat: 0,
      repeatDelay: 2000
    });
  }

  animComplete(animation) {
    if (animation.key === 'player_attack') {
      this.bolt.visible = true;
      this.bolt.play('magic_effect');
      this.magicAttackBtn.play('cooldown_animation');
    }
  }

  setupBtn(btn_x, btn_y) {
    this.add.image(btn_x, btn_y, 'magicAttack').setScale(.5)
    this.magicAttackBtn = this.add.sprite(btn_x, btn_y, 'cooldown_sheet').setFlipX(false).setScale(1)

    this.magicAttackBtn.on('animationcomplete', () => {
      isMagicReady = true;
      if (total_attack < 3) {
        this.noti.setText('Magic is ready now!');
      }
    });

    let circle2 = this.add.circle(btn_x, btn_y, 150, 0x000000, 0).setScale(.1)
    // circle.lineStyle(10, 0xffffff, 0.9);
    circle2.setStrokeStyle(50, 0x000000, 1);

    this.magicAttackBtn.setInteractive();
    this.magicAttackBtn.on('pointerdown', () => {
      if (total_attack < 3) {
        if (isMagicReady) {
          this.player.play('player_attack');
          this.player.on('animationcomplete', this.animComplete, this);
          this.noti.setText('');
          isMagicReady = false;
          // this.perform();
          total_attack++;
        }
        else {
          this.noti.setText('Magic is not ready yet!');
        }
      }
    }, this);

    this.noti = this.add.text(this.magicAttackBtn.x + 30, this.magicAttackBtn.y - 10, '');
    this.noti.setFontSize(12);
  }

  setupBattle() {
    this.magicAttackBtn.play('cooldown_animation');
    this.enemies.forEach((enemy) => {
      enemy.play('frog_idle', true);
      enemy.setAlpha(1);
      enemy.setTexture('frog_attack1');
    });
    // this.noti.setText('');
    total_attack = 0;
    isMagicReady = false;
  }

  createEnemy(x, y) {
    let enemy = this.add.sprite(x, y, 'frog_attack1').setOrigin(0, 0);
    enemy.setScale(.6);
    enemy.flipX = true;
    this.enemies.push(enemy);
  }

  setupBolt() {
    this.bolt.setScale(2);
    this.bolt.visible = false;

    this.bolt.on('animationcomplete', () => {
      this.bolt.visible = false;
      this.enemies.forEach((item) => {
        item.stop();
        item.setTexture('frog_attack1');
        if (total_attack === 1) {
          item.setAlpha(.7);
        } else if (total_attack === 2) {
          item.setAlpha(.3);
        } else if (total_attack === 3) {
          item.setAlpha(0);
          this.noti.setText('Congratulations!\nMission complete!');
        }
      });
    });
  }
  create() {
    var offsetX = 300 / 2.5;
    var offsetY = 220 / 2.5 - 15;
    var incrementX = 25;
    var incrementY = 15;

    let btn_x = 20, btn_y = 180
    this.setupBtn(btn_x, btn_y);
    this.player = this.physics.add.sprite(100 / 2.5, offsetY, 'brawler', 30).setOrigin(0);
    this.player.setScale(.6);
    this.player.setFlipX(true);

    this.enemies = [];
    this.setupAnimation();
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 5; x++) {
        let posx = x * incrementX + offsetX;
        let posy = y * incrementY + offsetY;
        this.createEnemy(posx, posy);
      }
    }

    this.bolt = this.add.sprite(offsetX + 3 * incrementX, offsetY + 2 * incrementY, 'bolt');
    this.setupBolt();
    this.setupBattle();
  }
}

var config = {
  width: 320,
  height: 240,
  zoom: 2.5,
  // zoom:2,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false // set to true to view zones
    }
  },
  backgroundColor: 0x000000,
  scene: [BootScene]
}

var game = new Phaser.Game(config);
