# grpc-deadlock
This repository demonstrates a problem using https://github.com/grpc/grpc-node/tree/master/packages/grpc-native-core in 
Docker environment. 

To demonstrate the problem, run
```
$ ./build.sh
$ ./run.sh
```

**Expected result**: run.sh completes without errors.

**Actual result**: it hangs indefinitely. The event loop of the Node.js process is blocked.

**GRPC debug log**:
```
I0822 13:25:31.397663594      25 call.cc:588]                grpc_call_unref(c=0x404c3e0)
I0822 13:25:31.397684764      25 metadata_array.cc:34]       grpc_metadata_array_destroy(array=0x3fd1028)
I0822 13:25:31.397688753      25 metadata_array.cc:34]       grpc_metadata_array_destroy(array=0x404e968)
I0822 13:25:31.397693920      25 completion_queue.cc:851]    grpc_completion_queue_next(cq=0x4024e30, deadline=gpr_timespec { tv_sec: -9223372036854775808, tv_nsec: 0, clock_type: 0 }, reserved=(nil))
    client requesting ::1:1234
I0822 13:25:31.398881828      25 channel.cc:267]             grpc_channel_get_target(channel=0x404b610)
I0822 13:25:31.399020299      25 metadata_array.cc:29]       grpc_metadata_array_init(array=0x3fd1028)
I0822 13:25:31.399069448      25 call.cc:1983]               grpc_call_start_batch(call=0x404c3e0, ops=0x3fa7010, nops=1, tag=0x3fc34a0, reserved=(nil))
I0822 13:25:31.399078080      25 call.cc:1593]               ops[0]: SEND_INITIAL_METADATA(nil)
I0822 13:25:31.399086943      25 client_channel.cc:1116]     chand=0x404b6d0 calld=0x404cda0: adding pending batch at index 0
I0822 13:25:31.399091805      25 client_channel.cc:3064]     chand=0x404b6d0 calld=0x404cda0: entering client_channel combiner
I0822 13:25:31.399097693      25 client_channel.cc:218]      chand=0x404b6d0: starting name resolution
D0822 13:25:31.399102180      25 dns_resolver.cc:280]        Start resolving.
I0822 13:25:31.399115064      25 client_channel.cc:2828]     chand=0x404b6d0 calld=0x404cda0: deferring pick pending resolver result
I0822 13:25:31.399465799      25 call.cc:1983]               grpc_call_start_batch(call=0x404c3e0, ops=0x3fa7010, nops=1, tag=0x3fab4e0, reserved=(nil))
I0822 13:25:31.399503382      25 call.cc:1593]               ops[0]: SEND_MESSAGE ptr=0x4051990
I0822 13:25:31.399564515      25 metadata_array.cc:29]       grpc_metadata_array_init(array=0x4051ae8)
I0822 13:25:31.399571076      25 metadata_array.cc:29]       grpc_metadata_array_init(array=0x404df38)
I0822 13:25:31.399575515      25 call.cc:1983]               grpc_call_start_batch(call=0x404c3e0, ops=0x404dbf0, nops=4, tag=0x3fd15e0, reserved=(nil))
I0822 13:25:31.399579348      25 call.cc:1593]               ops[0]: SEND_CLOSE_FROM_CLIENT
I0822 13:25:31.399582785      25 call.cc:1593]               ops[1]: RECV_INITIAL_METADATA ptr=0x4051ae8
I0822 13:25:31.399585894      25 call.cc:1593]               ops[2]: RECV_MESSAGE ptr=0x404dd68
I0822 13:25:31.399590396      25 call.cc:1593]               ops[3]: RECV_STATUS_ON_CLIENT metadata=0x404df38 status=0x404df50 details=0x404df58
I0822 13:25:31.399638842      25 completion_queue.cc:851]    grpc_completion_queue_next(cq=0x4024e30, deadline=gpr_timespec { tv_sec: -9223372036854775808, tv_nsec: 0, clock_type: 0 }, reserved=(nil))
I0822 13:25:31.400292208      25 client_channel.cc:485]      chand=0x404b6d0: got resolver result: resolver_result=0x3fc0ed0 error="No Error"
I0822 13:25:31.400397687      25 client_channel.cc:398]      chand=0x404b6d0: created new LB policy "pick_first" (0x40523d0)
I0822 13:25:31.400405098      25 connectivity_state.cc:92]   CONWATCH: 0x40525b8 pick_first: get IDLE
I0822 13:25:31.400408359      25 connectivity_state.cc:116]  CONWATCH: 0x40525b8 pick_first: from IDLE [cur=IDLE] notify=0x3fd1578
I0822 13:25:31.400412078      25 client_channel.cc:177]      chand=0x404b6d0: setting connectivity state to IDLE
I0822 13:25:31.400414985      25 connectivity_state.cc:164]  SET: 0x404b758 client_channel: IDLE --> IDLE [resolver_result] error=(nil) "No Error"
I0822 13:25:31.400418320      25 client_channel.cc:2917]     chand=0x404b6d0 calld=0x404cda0: resolver returned, doing LB pick
I0822 13:25:31.400421013      25 client_channel.cc:2756]     chand=0x404b6d0 calld=0x404cda0: applying service config to call
I0822 13:25:31.400423385      25 client_channel.cc:2665]     chand=0x404b6d0 calld=0x404cda0: starting pick on lb_policy=0x40523d0
I0822 13:25:31.400426081      25 connectivity_state.cc:116]  CONWATCH: 0x4053330 subchannel: from IDLE [cur=IDLE] notify=0x404dcf8
I0822 13:25:31.400429912      25 connectivity_state.cc:164]  SET: 0x4053330 subchannel: IDLE --> CONNECTING [state_change] error=(nil) "No Error"
I0822 13:25:31.400494264      25 connectivity_state.cc:190]  NOTIFY: 0x4053330 subchannel: 0x404dcf8
```

**Hanging process stacktrace**:
```
(gdb) bt
#0  __lll_lock_wait () at ../nptl/sysdeps/unix/sysv/linux/x86_64/lowlevellock.S:135
#1  0x00007fba9b8fb479 in _L_lock_909 () from /lib/x86_64-linux-gnu/libpthread.so.0
#2  0x00007fba9b8fb2a0 in __GI___pthread_mutex_lock (mutex=0x4052f18) at ../nptl/pthread_mutex_lock.c:79
#3  0x00007fba992f6319 in gpr_mu_lock (mu=<optimized out>) at ../deps/grpc/src/core/lib/gpr/sync_posix.cc:47
#4  0x00007fba9928047f in connected (arg=0x4052f10, error=0x40541e0)
    at ../deps/grpc/src/core/ext/transport/chttp2/client/chttp2_connector.cc:172
#5  0x00007fba9925c2c1 in exec_ctx_run (error=0x40541e0, closure=<optimized out>)
    at ../deps/grpc/src/core/lib/iomgr/exec_ctx.cc:40
#6  grpc_core::ExecCtx::Flush (this=this@entry=0x7fff4adf27d0) at ../deps/grpc/src/core/lib/iomgr/exec_ctx.cc:128
#7  0x00007fba992e8ffe in ~ExecCtx (this=0x7fff4adf27d0, __in_chrg=<optimized out>)
    at ../deps/grpc/src/core/lib/iomgr/exec_ctx.h:108
#8  custom_connect_callback (socket=<optimized out>, error=0x40541e0)
    at ../deps/grpc/src/core/lib/iomgr/tcp_client_custom.cc:100
#9  0x00007fba9928016a in chttp2_connector_connect (con=0x4052f10, args=0x7fff4adf2940, result=0x4053290,
    notify=0x40532a0) at ../deps/grpc/src/core/ext/transport/chttp2/client/chttp2_connector.cc:215
#10 0x00007fba9928e7dc in continue_connect_locked (c=0x4053260)
    at ../deps/grpc/src/core/ext/filters/client_channel/subchannel.cc:408
#11 maybe_start_connecting_locked (c=0x4053260) at ../deps/grpc/src/core/ext/filters/client_channel/subchannel.cc:483
#12 0x00007fba9928f415 in grpc_subchannel_notify_on_state_change (c=0x4053260, interested_parties=0xdeafbeef,
    state=0x405281c, notify=<optimized out>) at ../deps/grpc/src/core/ext/filters/client_channel/subchannel.cc:532
#13 0x00007fba992d9e07 in grpc_core::SubchannelData<grpc_core::(anonymous namespace)::PickFirst::PickFirstSubchannelList, grpc_core::(anonymous namespace)::PickFirst::PickFirstSubchannelData>::StartConnectivityWatchLocked (
    this=<optimized out>) at ../deps/grpc/src/core/ext/filters/client_channel/lb_policy/subchannel_list.h:304
#14 0x00007fba992dac70 in StartPickingLocked (this=0x40523d0)
    at ../deps/grpc/src/core/ext/filters/client_channel/lb_policy/pick_first/pick_first.cc:249
#15 grpc_core::(anonymous namespace)::PickFirst::PickLocked (this=0x40523d0, pick=0x404ceb0)
    at ../deps/grpc/src/core/ext/filters/client_channel/lb_policy/pick_first/pick_first.cc:270
#16 0x00007fba99289e2a in StartLocked (elem=<optimized out>)
    at ../deps/grpc/src/core/ext/filters/client_channel/client_channel.cc:2687
#17 process_service_config_and_start_lb_pick_locked (elem=0x404cd80)
    at ../deps/grpc/src/core/ext/filters/client_channel/client_channel.cc:2815
#18 grpc_core::ResolverResultWaiter::DoneLocked (arg=0x40514a0, error=0x0)
    at ../deps/grpc/src/core/ext/filters/client_channel/client_channel.cc:2920
#19 0x00007fba992a2332 in grpc_combiner_continue_exec_ctx () at ../deps/grpc/src/core/lib/iomgr/combiner.cc:260
#20 0x00007fba9925c2e4 in grpc_core::ExecCtx::Flush (this=this@entry=0x7fff4adf2b00)
    at ../deps/grpc/src/core/lib/iomgr/exec_ctx.cc:131
#21 0x00007fba992a364a in ~ExecCtx (this=0x7fff4adf2b00, __in_chrg=<optimized out>)
    at ../deps/grpc/src/core/lib/iomgr/exec_ctx.h:108
#22 grpc_custom_resolve_callback (r=0x3fc2bc0, result=0x3fa6e80, error=<optimized out>)
    at ../deps/grpc/src/core/lib/iomgr/resolve_address_custom.cc:85
#23 0x0000000001410b75 in uv__work_done (handle=0x2179ab0 <default_loop_struct+176>)
    at ../deps/uv/src/threadpool.c:251
#24 0x0000000001412c8b in uv__async_io (loop=0x2179a00 <default_loop_struct>, w=<optimized out>,
    events=<optimized out>) at ../deps/uv/src/unix/async.c:118
#25 0x0000000001424d48 in uv__io_poll (loop=loop@entry=0x2179a00 <default_loop_struct>, timeout=25)
    at ../deps/uv/src/unix/linux-core.c:400
#26 0x0000000001413616 in uv_run (loop=0x2179a00 <default_loop_struct>, mode=UV_RUN_DEFAULT)
    at ../deps/uv/src/unix/core.c:368
#27 0x00000000008d443d in node::Start(uv_loop_s*, int, char const* const*, int, char const* const*) ()
#28 0x00000000008cc8fd in node::Start(int, char**) ()
#29 0x00007fba9b567b45 in __libc_start_main (main=0x89b0c0 <main>, argc=2, argv=0x7fff4adf7208, init=<optimized out>,
    fini=<optimized out>, rtld_fini=<optimized out>, stack_end=0x7fff4adf71f8) at libc-start.c:287
#30 0x000000000089b1b1 in _start ()
```
