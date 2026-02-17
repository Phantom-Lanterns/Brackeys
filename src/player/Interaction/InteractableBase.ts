import Player from "../Player";
import { IInteractable } from "./IInteractable";

export abstract class InteractableBase implements IInteractable {
  onInteract(player: Player) {
        console.log("Interacted with an object!");
  }
}
