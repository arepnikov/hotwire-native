# MainActivity

Start from main/master branches on both repositories

Open MainActivity.kt

File: `java/com/example/hotwirenativeworkshop/main/MainActivity.kt`

Here we can configure Backend endpoint:

```Kotlin
override fun navigatorConfigurations() = listOf(
  NavigatorConfiguration(
    name = "main",
    startLocation = KanbanBoard.current.url,
    navigatorHostId = R.id.main_nav_host
  )
)
```

In our case we're using KanbanBoard class to store Remove and Local url's.

Open `java/com/example/hotwirenativeworkshop/KanbanBoard.kt` and change in line 5:
`Environment.Remote` -> `Environment.Local`.

Image: 0_initial

# Native Title

[Rails side]

Screenshots:
- before: 1_old_title.png
- after: 2_new_title.png

File: `app/views/boards/index.html.erb`

Add on top:
```ruby
<% content_for :title, "Boards" if turbo_native_app? %>
```

Additionally we can update board's show page:

File: `app/views/boards/show.html.erb`

Add:
```ruby
<% content_for :title, @board.name if turbo_native_app? %>
```

# First Bridge Component: ButtonComponent

[Android side]

1. In projects root `com.example.hotwirenativeworkshop` create new Package: 'bridge'
2. Inside create "Kotlin Class/File' and call it `ButtonComponent`
3. Paste a scaffold of bridge component:

```Kotlin
package com.example.hotwirenativeworkshop.bridge

import android.util.Log
import dev.hotwire.core.bridge.BridgeComponent
import dev.hotwire.core.bridge.BridgeDelegate
import dev.hotwire.core.bridge.Message
import dev.hotwire.navigation.destinations.HotwireDestination
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

class ButtonComponent(
    name: String,
    private val delegate: BridgeDelegate<HotwireDestination>
) : BridgeComponent<HotwireDestination>(name, delegate) {

    override fun onReceive(message: Message) {
        // Handle incoming messages based on the message `event`.
        when (message.event) {
            "connect" -> handleConnectEvent(message)
            else -> Log.w("ButtonComponent", "Unknown event for message: $message")
        }
    }

    private fun handleConnectEvent(message: Message) {
        val data = message.data<MessageData>() ?: return

        // Write native code to display a native submit button in the
        // toolbar displayed in the delegate.destination. Use the
        // incoming data.title to set the button title.
    }

    private fun performButtonClick(): Boolean {
        return replyTo("connect")
    }

    // Use kotlinx.serialization annotations to define a serializable
    // data class that represents the incoming message.data json.
    @Serializable
    data class MessageData(
        @SerialName("title") val title: String
    )
}
```

Now we need to let know our App about new bridge component:

Open `java/com/example/hotwirenativeworkshop/KanbanBoardApplication.kt`.

Paste code into method `configureApp` and import required dependencies:

```Kotlin
// Register bridge components
Hotwire.registerBridgeComponents(
    BridgeComponentFactory("button", ::ButtonComponent)
)
```

## ButtonComponent implementation

On this stage we have bridge component, but it do nothing - let's implement it!

Switch back to file: `java/com/example/hotwirenativeworkshop/bridge/ButtonComponent.kt`

Inside class on it's top paste:

```Kotlin
// A unique integer ID for your menu item (any number, just needs to be unique)
private val buttonItemId = 37

// Keep a reference to the menu item so you can manipulate it later
private var buttonMenuItem: MenuItem? = null

// Get the Fragment that hosts this screen
private val fragment: Fragment
    get() = delegate.destination.fragment

// Find the Toolbar view inside that Fragment
private val toolbar: Toolbar?
    get() = fragment.view?.findViewById(R.id.toolbar)
```

then add a method:
```Kotlin
private fun showToolbarButton(data: MessageData) {
    val menu = toolbar?.menu ?: return
    val order = 999 // Show as the right-most button

    val title = SpannableString(data.title).apply {
        setSpan(ForegroundColorSpan("#FF6600".toColorInt()), 0, length, 0)
    }

    menu.removeItem(buttonItemId)  // Remove any existing button first (prevents duplicates)
    buttonMenuItem = menu.add(Menu.NONE, buttonItemId, order, title).apply {
        setShowAsAction(MenuItem.SHOW_AS_ACTION_ALWAYS)  // Always show in toolbar, not overflow
        setOnMenuItemClickListener {
            performButtonClick()  // Wire the tap to reply back to JS
            true
        }
    }
}
```

not use this method in `handleConnectEvent`:

```Kotlin
private fun handleConnectEvent(message: Message) {
    val data = message.data<MessageData>() ?: return
    showToolbarButton(data)
}
```

## Install Hotwire Native Bridge Support in Rails app

Rails app need `hotwired/hotwire-native` and `hotwired/hotwire-native-bridge` JS libraries to
support Native features. Since App already used Hotwire Turbostreams, only bridge library is missing.

Navigate in terminal to place where you cloned Rails repository `hotwire-native-workshop-rails`

Run:
```
./bin/importmap pin @hotwired/hotwire-native-bridge
```

## Native Button Stimulus Controller

HTML page uses Stimulus controllers to connect with bridge components.

Let's add the first one - Button Controller!

Create new folder `app/javascript/controllers/bridge` and then create new file: `button_controller.js`:

```JS
import { BridgeComponent } from "@hotwired/hotwire-native-bridge"

export default class extends BridgeComponent {
  static component = "button"

  connect() {
    super.connect()

    const element = this.bridgeElement
    const title = element.bridgeAttribute("title")
    this.send("connect", {title}, () => {
      this.element.click()
    })
  }
}
```

and use it in HTML: open `app/views/boards/index.html.erb` and replace link in line 8:

```html
<%= link_to 'New Board', new_board_path,
            class: 'btn btn-outline-primary',
            data: {
              controller: "bridge--button",
              bridge_title: "New Board",
            } %>
```

Screenshots:
- before: 2_new_title.png
- after: 3_native_button.png


On this stage we have our first bridge component functional.

You may switch to branch: `button-component` on both Rails and Android repositories


# Let's use Modal!

Screenshots:
- before: 4_no_modal.png
- after: 5_with_modal.png

For this we need to apply two changes:
- use '_top' to break through TurboFrame, which will cause navigation process
- let Android app know that for `/boards/new` it should use modal.

First on Rails side - open `app/views/boards/index.html.erb` and change link by adding
`**(turbo_native_app? ? { turbo_frame: "_top" } : {})`:

Link should look like:
```html
<%= link_to 'New Board', new_board_path,
            class: 'btn btn-outline-primary',
            data: {
              controller: "bridge--button",
              bridge_title: "New Board",
              **(turbo_native_app? ? { turbo_frame: "_top" } : {})
            } %>
```

Then on Android side - change `assets/json/path-configuration.json`, by adding:
```json
{
  "patterns": [
    "/boards/new$"
  ],
  "properties": {
    "context": "modal",
    "uri": "hotwire://fragment/web/modal/sheet",
    "pull_to_refresh_enabled": false
  }
}
```

### Hide Redundant HTML

Since we already have Native alternatives for "New Board" and title, let's clean a view:

Paste new css into `app/assets/stylesheets/kanban.scss`:

```css
// Hotwire Native: hide elements that are replaced by native UI
.turbo-native {
  // Hide the "New Board" button — replaced by the native toolbar button (ButtonComponent)
  [data-controller="bridge--button"] {
    display: none;
  }

  // Hide page headers — title and actions are shown in the native toolbar instead
  .boards-header {
    display: none;
  }
}
```

We used 'turbo-native' class to controll css in different way on Web and on Native app.
So let's add it!

Replace line 25 in `app/views/layouts/application.html.erb`:

```html
<body class="<%= 'turbo-native' if turbo_native_app? %>">
```

Screenshots:
- before: 6_unclean_top.png
- after: 7_cleaned_top.png

## Make Modal Dissmiss on Submit

If we submit a form, modal will be still visible - reason: original servise uses Turbo Streams and
use replace action, which happens inside Turbo Frame.

Screenshots:
- before: 8_dismiss_before.png
- after: 9_dismiss_after_submit.png

To fix that we again has to break TurboFrame with `_top` and force server respond with redirect.
This will cause an app to detect navigation and will apply path-configuration rules to dismiss modal
and show new board view.

[Rails side]

Replace line 1 in `app/views/boards/_form.html.erb`

```
<%= form_for @board, class: 'col-12', data: ({ turbo_frame: '_top' } if turbo_native_app?) do |form| %>
```

Then go to BoardsController

File: `app/controllers/boards_controller.rb`

We going to utilze Layout Variant - Rails docs: https://guides.rubyonrails.org/layouts_and_rendering.html#the-variants-option

First create a method and add it as `before_action`:

```ruby
before_action :set_native_variant, if: -> { turbo_native_app? }, only: %i[ create ]

private

def set_native_variant
  request.variant = :native
end
```

It will allow to use `respond_to` with `format.turbo_stream.native` like this:

```ruby
def create
  @board = Board.new(board_params)

  respond_to do |format|
    if @board.save
      format.html { redirect_to boards_url, notice: "Board was successfully created." }
      format.turbo_stream.native { redirect_to boards_url }
      format.turbo_stream
    else
      format.html { render :new, status: :unprocessable_entity }
    end
  end
end
```

Great! Now modal dismiss. We are almost done :)

## Replace Boards

There still is an issue - our refreshed board page was pushed as a next view on top of previous.

Screenshot:
  - 10_board_on_board.png

This again will require to configura how application should react on navigation.

[Android side]

Open path-configuration.json: `assets/json/path-configuration.json` and paste:

```json
{
  "patterns": [
    "/boards$"
  ],
  "properties": {
    "context": "default",
    "uri": "hotwire://fragment/web",
    "presentation": "replace",
    "pull_to_refresh_enabled": true
  }
},
```

the key part is `"presentation": "replace",` which instract app to replace top view with the new one.

You may switch to branch: `new-board-modal` on both Rails and Android repositories

# Form Component

Let's make "New Board" form native as well :)

Let's again start from a scaffold:

create new Kotlin Class/File: `bridge/FormComponent`:

```ruby
package com.example.hotwirenativeworkshop.bridge

import android.util.Log
import dev.hotwire.core.bridge.BridgeComponent
import dev.hotwire.core.bridge.BridgeDelegate
import dev.hotwire.core.bridge.Message
import dev.hotwire.navigation.destinations.HotwireDestination
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

class FormComponent(
    name: String,
    private val delegate: BridgeDelegate<HotwireDestination>
) : BridgeComponent<HotwireDestination>(name, delegate) {

    override fun onReceive(message: Message) {
        // Handle incoming messages based on the message `event`.
        when (message.event) {
            "connect" -> handleConnectEvent(message)
            "submitEnabled" -> handleSubmitEnabled()
            "submitDisabled" -> handleSubmitDisabled()
            else -> Log.w("ButtonComponent", "Unknown event for message: $message")
        }
    }

    private fun handleConnectEvent(message: Message) {
        val data = message.data<MessageData>() ?: return
        showToolbarButton(data)
    }

    private fun showToolbarButton(data: MessageData) {
        // Write native code to display a native submit button in the
        // toolbar displayed in the delegate.destination. Use the
        // incoming data.title to set the button title.
    }

    private fun handleSubmitEnabled() {
        toggleSubmitButton(true)
    }

    private fun handleSubmitDisabled() {
        toggleSubmitButton(false)
    }

    private fun toggleSubmitButton(enable: Boolean) {
        // TODO
    }

    private fun performSubmit(): Boolean {
        return replyTo("connect")
    }

    // Use kotlinx.serialization annotations to define a serializable
    // data class that represents the incoming message.data json.
    @Serializable
    data class MessageData(
        @SerialName("submitTitle") val title: String
    )
}
```

and register it in app: `java/com/example/hotwirenativeworkshop/KanbanBoardApplication.kt`:

```
// Register bridge components
Hotwire.registerBridgeComponents(
    BridgeComponentFactory("button", ::ButtonComponent),
    BridgeComponentFactory("form", ::FormComponent)
)
```

## Implement FormComponent:

add private variables:

```
private val submitButtonItemId = 38
private var submitMenuItem: MenuItem? = null

private val fragment: Fragment
    get() = delegate.destination.fragment

private val toolbar: Toolbar?
    get() = fragment.view?.findViewById(R.id.toolbar)
```

Replace `showToolbarButton` method:

```
private fun showToolbarButton(data: MessageData) {
    val menu = toolbar?.menu ?: return
    val order = 999 // Show as the right-most button

    val title = SpannableString(data.title).apply {
        setSpan(ForegroundColorSpan("#FF6600".toColorInt()), 0, length, 0)
    }

    menu.removeItem(submitButtonItemId)  // Remove any existing button first (prevents duplicates)
    submitMenuItem = menu.add(Menu.NONE, submitButtonItemId, order, title).apply {
        setShowAsAction(MenuItem.SHOW_AS_ACTION_ALWAYS)  // Always show in toolbar, not overflow
        setOnMenuItemClickListener {
            performSubmit()
            true
        }
    }
}
```

## Native Form Stimulus Controller

Now we'll prepare to use new bridge component on our page.

Create a file `app/javascript/controllers/bridge/form_controller.js`:

```js
import { BridgeComponent } from "@hotwired/hotwire-native-bridge"
import { BridgeElement } from "@hotwired/hotwire-native-bridge"

export default class extends BridgeComponent {
  static component = "form"
  static targets = [ "submit" ]

  connect() {
    super.connect()
    this.notifyBridgeOfConnect()
  }

  notifyBridgeOfConnect() {
    const submitButton = new BridgeElement(this.submitTarget)
    const submitTitle = submitButton.title

    this.send("connect", { submitTitle }, () => {
      this.submitTarget.click()
    })
  }

  submitStart(event) {
    this.submitTarget.disabled = true
    this.send("submitDisabled")
  }

  submitEnd(event) {
    this.submitTarget.disabled = false
    this.send("submitEnabled")
  }
}
```

This Stimulus controller is a bit other - it has target, so we have to add it to a form and extend submit button with required data:

File: `app/views/boards/_form.html.erb`

First update form definition:
```
<%= form_for @board,
            class: 'col-12',
            data: {
              controller: "bridge--form",
              action: "turbo:submit-start->bridge--form#submitStart turbo:submit-end->bridge--form#submitEnd",
              **(turbo_native_app? ? { turbo_frame: "_top" } : {})
            } do |form| %>
```

Then find form.submit link and replace it as well:

```
<%= form.submit 'Save',
                class: 'btn btn-outline-primary',
                data: {
                  bridge__form_target: "submit",
                  bridge_title: "Save",
                } %>
```

Screenshots:
- before: 11_modal_no_native_btn.png
- after: 12_modal_with_native_btn.png

## Separate view for native modal

At this stage we have fully functional modal form "New Board". But it looks too web.

In typical case we would use css to change it maybe we some `turbo_native_app?` conditions.
In this particular case it will make view unreadable.

To keep it readable we will create a separate native view and with use native variant:

Create file: `app/views/boards/new.html+native.erb`:

```
<% content_for :title, "New Board" %>

<%= form_for @board,
      data: {
        controller: "bridge--form",
        action: "turbo:submit-start->bridge--form#submitStart turbo:submit-end->bridge--form#submitEnd",
        turbo_frame: "_top"
      } do |form| %>

  <% if @board.errors.any? %>
    <% @board.errors.full_messages.each do |message| %>
      <p class="text-center text-orange-600"><%= message %></p>
    <% end %>
  <% end %>

  <div class="px-3 py-2">
    <%= form.text_field :name, placeholder: 'Board name', class: 'form-control w-100' %>
  </div>

  <%= form.submit 'Save', class: 'd-none',
        data: { bridge__form_target: "submit", bridge_title: "Save" } %>
<% end %>
```

Then restore previous view: `app/views/boards/_form.html.erb`

```
<%= form_for @board, class: 'col-12' do |form| %>
  <% if @board.errors.any? %>
    <% @board.errors.full_messages.each do |message| %>
      <p class="text-center text-orange-600">
      <%= message %>
      </p>
    <% end %>
  <% end %>

  <div class="row">
    <div class="col">
      <div class="form-group my-2">
        <%= form.text_field :name, placeholder: 'Board name', class: 'form-control' %>
      </div>
    </div>

    <div class="col d-flex align-items-end">
      <div class="actions mb-2 text-center">
        <%= link_to 'Cancel', boards_path, class: 'btn btn-outline-info' %>
        <%= form.submit 'Save', class: 'btn btn-outline-primary' %>
      </div>
    </div>
  </div>
<% end %>

```

and in boards_controler: `app/controllers/boards_controller.rb` add 'new' action to `:set_native_variant` before_action:

```ruby
before_action :set_native_variant, if: -> { turbo_native_app? }, only: %i[ new create ]
```

Screenshot:
- 13_redesigned-modal.png

You may switch to branch: `form-component` on both Rails and Android repositories.
