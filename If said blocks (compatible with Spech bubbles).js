(function (Scratch) {
  "use strict";
  if (!Scratch.extensions.unsandboxed) throw new Error("Speech Bubbles If Said must run unsandboxed");
 
  const runtime = Scratch.vm.runtime;
  function makeEncodedID(id) {
    if (id === undefined) return undefined;
    try {
      return btoa(id).replaceAll("=", "_").replaceAll("/", "-");
    } catch {
      return undefined;
    }
  }
 
  function getBubbleText(targetId) {
    const encodedId = makeEncodedID(targetId);
    if (!encodedId) return "";
    const el = document.querySelector(
      `div[id="SP_Speech-Ext-${encodedId}"] div[id="text-ID"]`
    );
    if (!el) return "";
    return el.innerText ?? el.textContent ?? "";
  }
 
  class SpeechBubbleIfSaid {
    getInfo() {
      return {
        id: "speechbubbleifsaid",
        name: "If said...",
        color1: "#9966FF",
        color2: "#7755CC",
        blocks: [
          {
            opcode: "ifSaid",
            blockType: Scratch.BlockType.CONDITIONAL,
            text: "if [SPRITE] said [TEXT]",
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                menu: "TARGETS"
              },
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "hello!",
              },
            },
          },
          {
            opcode: "ifSaidElse",
            blockType: Scratch.BlockType.LOOP,
            text: ["if [SPRITE] said [TEXT]", "else"],
            branchCount: 2,
            hideLoopArrow: true,
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                menu: "TARGETS"
              },
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "hello!",
              },
            },
          },
          "---",
          {
            opcode: "currentBubble",
            blockType: Scratch.BlockType.REPORTER,
            text: "bubble text of [SPRITE]",
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                menu: "TARGETS"
              },
            },
          },
        ],
        menus: {
          TARGETS: {
            acceptReporters: true,
            items: "getTargets"
          }
        }
      };
    }
 
    getTargets() {
      const spriteNames = [{ text: "myself", value: "_myself_" }];
      const targets = runtime.targets;
      for (let i = 1; i < targets.length; i++) {
        const target = targets[i];
        if (target.isOriginal) {
          spriteNames.push({ text: target.getName(), value: target.getName() });
        }
      }
      return spriteNames.length > 0 ? spriteNames : [""];
    }
    resolveTarget(sprite, util) {
      if (sprite === "_myself_") return util.target.id;
      const byId = runtime.getTargetById(sprite);
      if (byId) return byId.id;
      return runtime.getSpriteTargetByName(sprite)?.id ?? undefined;
    }
 
    ifSaid(args, util) {
      const id = this.resolveTarget(args.SPRITE, util);
      const currentText = getBubbleText(id);
      const matches = currentText === args.TEXT;
      return matches ? 0 : -1;
    }
 
    ifSaidElse(args, util) {
      const id = this.resolveTarget(args.SPRITE, util);
      const currentText = getBubbleText(id);
      const matches = currentText === args.TEXT;
      if (util.stackFrame.executedBranch === undefined) {
        util.stackFrame.executedBranch = true;
        return matches ? 0 : 1;
      }
      return null;
    }
 
    currentBubble(args, util) {
      const id = this.resolveTarget(args.SPRITE, util);
      return getBubbleText(id);
    }
  }
 
  Scratch.extensions.register(new SpeechBubbleIfSaid());
})(Scratch);
