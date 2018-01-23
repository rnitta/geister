enchant();
var size = {
  w: 512,
  h: 512
}
var game = new Game(size.w, size.w);
var scene = new Scene();
var map = new Map(64, 64);
var instruction = new Scene();
var socket, timer1;

window.onload = function() {

  game.preload('/img/chip.png', '/img/chara1.png', '/img/chara2.png', '/img/chara3.png');
  game.fps = 15;
  game.onload = function() {
    game.pushScene(scene);
    set_init_map();
    socket = io.connect();
    match();
    socket.on('match_completed', (data) => {
      console.log(data)
      clearInterval(timer1)
      game.popScene(matching)
      display_instruction();

      //キャラ移動
      var pad = 14;
      var chara_map = [
        [1, 2, 1, 1, 1, 1, 2, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
      ];
      var move_character = function(e) {
        for (key in dirs) {
          availables[key].x = -999;
          availables[key].y = -999;
        }
        var xy = map_pos(e.x, e.y);
        var past_xy = map_pos(selected_chara.x, selected_chara.y);
        selected_chara.x = xy[0] * 64 + 20;
        selected_chara.y = xy[1] * 64 + pad;
        chara_map[xy[1]][xy[0]] = chara_map[past_xy[1]][past_xy[0]];
        chara_map[past_xy[1]][past_xy[0]] = 0;
      };
      //移動可能場所
      var availables = {
        up: new Sprite(64, 64),
        down: new Sprite(64, 64),
        right: new Sprite(64, 64),
        left: new Sprite(64, 64)
      };
      var redrect = new Surface(64, 64);
      redrect.context.fillStyle = "rgba(255, 0, 0, 0.2)";
      redrect.context.fillRect(7, 7, 50, 50);
      for (key in availables) {
        availables[key].image = redrect;
        availables[key].x = -999;
        availables[key].y = -999;
        availables[key].ontouchend = move_character;
        scene.addChild(availables[key]);
      }
      //兵士
      var solds = [new Sprite(24, 32), new Sprite(24, 32), new Sprite(24, 32), new Sprite(24, 32)]
      solds.map(function(sold, i) {
        sold.image = game.assets['/img/chara2.png'];
        sold.frame = 76
        sold.scaleX = 3;
        sold.scaleY = 3;
        sold.x = 100 + 90 * i;
        sold.y = 160;
        instruction.addChild(sold);
      });
      //スパイ
      var spies = [new Sprite(24, 32), new Sprite(24, 32), new Sprite(24, 32), new Sprite(24, 32)]
      spies.map(function(spy, i) {
        spy.image = game.assets['/img/chara3.png'];
        spy.frame = 25;
        spy.scaleX = 1.6;
        spy.scaleY = 1.6;
        spy.x = -999;
        spy.y = -999;
        instruction.addChild(spy);
      });

      //駒配置
      var selected_chara;
      var nth = 0;
      var sol_pos = [];
      var sol_pos_str = [];
      chara_map.map(function(item, i) {
        item.map(function(val, j) {

        });
      });
      instruction.addEventListener(Event.TOUCH_END, function(e) {
        if (nth < 4) {
          var xy = tile_pos(e.x, e.y);
          if (xy && sol_pos_str.indexOf(xy.toString()) == -1) {
            solds[nth].scaleX = 1.6;
            solds[nth].scaleY = 1.6;
            solds[nth].x = 64 * 2 + 20 + 64 * xy[0];
            solds[nth].y = 64 * 5 + 64 * xy[1] + pad;
            chara_map[xy[1] + 5][xy[0] + 2] = 3;
            sol_pos.push(xy);
            sol_pos_str.push(xy.toString());
            nth++;
          }
        }
        if (nth == 4) {
          var left_pos = [];
          for (var i = 0; i <= 7; i++) {
            if (sol_pos_str.indexOf([i % 4, Math.floor(i / 4)].toString()) == -1) {
              left_pos.push([i % 4, Math.floor(i / 4)]);
              chara_map[Math.floor(i / 4) + 5][(i % 4) + 2] = 4;
            }
          }
          spies.map(function(spy, i) {
            spy.x = 64 * 2 + 22 + 64 * left_pos[i][0];
            spy.y = 64 * 5 + 64 * left_pos[i][1] + pad;
          })
          //説明削除
          game.popScene(instruction);
          //駒生成
          for (var i = 0; i <= 3; i++) {
            solds[i].ontouchend = available_zone;
            spies[i].ontouchend = available_zone;
            scene.addChild(solds[i]);
            scene.addChild(spies[i]);
          }
          //敵
          var enemies = []
          for (var i = 0; i <= 7; i++) {
            enemies[i] = new Sprite(24, 32);
            enemies[i].image = game.assets['/img/chara1.png'];
            enemies[i].frame = 73;
            enemies[i].scaleX = 1.6;
            enemies[i].scaleY = 1.6;
            enemies[i].x = 64 * 2 + 22 + (i % 4) * 64;
            enemies[i].y = 64 + Math.floor(i / 4) * 64 + pad;
            scene.addChild(enemies[i]);
            chara_map[Math.floor(i / 4) + 1][(i % 4) + 2] = 5;
            //敵が5
          }

          console.log(chara_map)
        }
      });
      var dirs = {};
      var available_zone = function(e) {
        selected_chara = this
        var current = map_pos(e.x, e.y)
        var up = [current[0], current[1] - 1];
        var down = [current[0], current[1] + 1];
        var right = [current[0] + 1, current[1]];
        var left = [current[0] - 1, current[1]];
        dirs = {
          up: up,
          down: down,
          right: right,
          left: left
        };
        for (key in dirs) {
          availables[key].x = -999;
          availables[key].y = -999;
          if (isthere(dirs[key]) == 0) {
            availables[key].x = dirs[key][0] * 64;
            availables[key].y = dirs[key][1] * 64;
          }
        }
      };

      function isthere(xy) {
        //[x,y]の配列の場所に何が有るかchara_mapを参照して返す関数
        return chara_map[xy[1]][xy[0]]
      }
    });

  }
  game.start();
};

function match() {
  var match_token;
  var room_name;

  socket.on('connect', function() {
    socket.emit('match_join');

  })
  matching = new Scene();
  game.pushScene(matching);
  var match_rect = new Sprite(size.w, size.h);
  var sur2 = new Surface(size.w, size.h);
  sur2.context.fillStyle = 'rgba(0, 0, 0, 0.9)';
  sur2.context.fillRect(10, 10, size.w - 20, size.h - 20);
  match_rect.image = sur2;
  matching.addChild(match_rect);
  matching_text = new Label('マッチ中');
  var dot = "."
  matching_text.width = size.w - 20
  matching_text.moveTo(100, 200);
  matching_text.color = '#ffffff'
  matching_text.font = "60px 'ヒラギノ角ゴシック', 'Hiragino Sans', 'ヒラギノ角ゴ ProN W3', 'Hiragino Kaku Gothic ProN', 'メイリオ', 'Meiryo', 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif";
  matching.addChild(matching_text)
  socket.on('room_issued', (data) => {
    console.log(data)
    timer1 = setInterval(()=>{
      matching_text.text = ('マッチ中' + dot)
      if(dot == "....."){
        dot = ""
      }
      dot = dot + '.'
    },200)
  });


}

function set_init_map() {
  map.image = game.assets['/img/chip.png'];
  var baseMap = [
    [2, 4, 3, 3, 3, 3, 4, 2],
    [2, 1, 0, 0, 0, 0, 1, 2],
    [2, 1, 0, 0, 0, 0, 1, 2],
    [2, 1, 1, 1, 1, 1, 1, 2],
    [2, 1, 1, 1, 1, 1, 1, 2],
    [2, 1, 0, 0, 0, 0, 1, 2],
    [2, 1, 0, 0, 0, 0, 1, 2],
    [2, 4, 3, 3, 3, 3, 4, 2],
  ];
  map.loadData(baseMap);
  scene.addChild(map);
}

function display_instruction() {
  //ゲーム説明
  var margin1 = 40;
  game.pushScene(instruction);
  var box = new Sprite(size.w, size.h / 2);
  var sur1 = new Surface(size.w, size.h);
  sur1.context.fillStyle = 'rgba(0, 0, 0, 0.9)';
  sur1.context.fillRect(margin1, margin1, size.w - margin1 * 2, size.h / 2 - margin1);
  box.image = sur1;
  instruction.addChild(box);
  var text1 = new Label('兵士を配置してください');
  text1.width = size.w - margin1 * 2
  text1.moveTo(margin1 + 10, margin1 + 10);
  text1.color = '#ffffff'
  text1.font = "32px 'ヒラギノ角ゴシック', 'Hiragino Sans', 'ヒラギノ角ゴ ProN W3', 'Hiragino Kaku Gothic ProN', 'メイリオ', 'Meiryo', 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif";
  instruction.addChild(text1)
  var text2 = new Label('(茶色のマスをタッチで設置できます)');
  text2.width = size.w - margin1 * 2
  text2.moveTo(margin1 + 10, margin1 + 50);
  text2.color = '#ffffff'
  text2.font = "20px 'ヒラギノ角ゴシック', 'Hiragino Sans', 'ヒラギノ角ゴ ProN W3', 'Hiragino Kaku Gothic ProN', 'メイリオ', 'Meiryo', 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif";
  instruction.addChild(text2)
}

function map_pos(x, y) {
  var xy = [];
  xy[0] = Math.floor(x / 64);
  xy[1] = Math.floor(y / 64);
  return xy
}

function tile_pos(x, y) {
  if (x >= 64 * 2 && x <= 64 * 6 && y >= 64 * 5 && y <= 64 * 7) {
    var xy = []
    xy[1] = Math.floor((y - 64 * 5) / 64)
    xy[0] = Math.floor((x - 64 * 2) / 64)
    return xy
  } else {
    return false
  }
}

function sleep(time, func) {
  setTimeout(func, time);

}
